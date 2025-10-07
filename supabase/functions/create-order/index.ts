import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

interface OrderRequest {
  items: OrderItem[];
  shipping_address: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  payment_method: string;
  payment_transaction_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const orderRequest: OrderRequest = await req.json();
    console.log('Creating order for user:', user.id);

    // Validate items and recalculate prices from database (NEVER trust client prices)
    const productIds = orderRequest.items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('id, name, current_price, stock, image_url')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw new Error('Failed to validate products');
    }

    // Verify stock and calculate actual total
    let totalAmount = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of orderRequest.items) {
      const product = products?.find(p => p.id === item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Use database price, not client price
      const actualPrice = Number(product.current_price);
      totalAmount += actualPrice * item.quantity;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url || '',
        quantity: item.quantity,
        price: actualPrice
      });
    }

    console.log('Validated total amount:', totalAmount);

    // Create order with transaction
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        shipping_address: orderRequest.shipping_address,
        status: orderRequest.payment_method === 'cod' ? 'pending' : 'awaiting_payment',
        payment_method: orderRequest.payment_method,
        payment_transaction_id: orderRequest.payment_transaction_id,
        payment_verified: orderRequest.payment_method === 'cod' ? false : false,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    console.log('Order created:', order.id);

    // Create order items
    const orderItems = validatedItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order
      await supabaseClient.from('orders').delete().eq('id', order.id);
      throw new Error('Failed to create order items');
    }

    // Create audit log entry
    await supabaseClient.from('order_audit_log').insert({
      order_id: order.id,
      user_id: user.id,
      old_status: null,
      new_status: order.status,
      changed_by: user.id,
      payment_transaction_id: orderRequest.payment_transaction_id,
      notes: `Order created via ${orderRequest.payment_method}`,
    });

    console.log('Order created successfully:', order.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: order.id,
        total_amount: totalAmount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in create-order function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
