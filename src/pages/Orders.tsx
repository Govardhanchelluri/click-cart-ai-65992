import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Package, ShoppingBag, Sparkles } from "lucide-react";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: {
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
  }[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            product_name,
            product_image,
            quantity,
            price
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-warning/10 text-warning",
      processing: "bg-primary/10 text-primary",
      shipped: "bg-info/10 text-info",
      delivered: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive"
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={0} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Orders</h1>
              <p className="text-muted-foreground">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>

          {orders.length === 0 ? (
            <Card className="p-12 text-center bg-gradient-hero border-primary/20">
              <Package className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No orders yet!</h2>
              <p className="text-muted-foreground mb-4">
                Start your shopping journey with ClickCart
              </p>
              
              {/* Motivational Quotes */}
              <div className="max-w-md mx-auto space-y-4 my-8">
                <div className="p-4 bg-background/50 rounded-lg border border-primary/10">
                  <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-sm italic">
                    "Customer satisfaction is our #1 priority. Shop with confidence!"
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-primary/10">
                  <Sparkles className="w-5 h-5 text-secondary mx-auto mb-2" />
                  <p className="text-sm italic">
                    "Experience AI-powered smart pricing. Save more, shop smarter!"
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-primary/10">
                  <Sparkles className="w-5 h-5 text-success mx-auto mb-2" />
                  <p className="text-sm italic">
                    "Join thousands of happy customers. Your satisfaction guaranteed!"
                  </p>
                </div>
              </div>

              <Button size="lg" onClick={() => navigate("/")}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Start Shopping Now
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id.substring(0, 8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.order_items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                          <img
                            src={item.product_image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop"}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ₹{(Number(item.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">
                          ₹{Number(order.total_amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;