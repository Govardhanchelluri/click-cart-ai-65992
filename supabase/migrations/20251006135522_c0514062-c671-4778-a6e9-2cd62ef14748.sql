-- Create products table for storing all products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  image_url TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,
  demand_level TEXT CHECK (demand_level IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create browsing history table
CREATE TABLE IF NOT EXISTS public.browsing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  category TEXT,
  search_query TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clickcart coins table for rewards
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  coins INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.browsing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Products policies (public read)
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist"
  ON public.wishlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist"
  ON public.wishlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist"
  ON public.wishlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

-- Browsing history policies
CREATE POLICY "Users can view their own browsing history"
  ON public.browsing_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their browsing history"
  ON public.browsing_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User rewards policies
CREATE POLICY "Users can view their own rewards"
  ON public.user_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
  ON public.user_rewards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
  ON public.user_rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_rewards_updated_at
  BEFORE UPDATE ON public.user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();