import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingBag } from "lucide-react";

interface WishlistProduct {
  id: string;
  name: string;
  image_url: string;
  original_price: number;
  current_price: number;
  rating: number;
  review_count: number;
  stock: number;
  is_popular: boolean;
  demand_level: "high" | "medium" | "low";
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wishlistData, error } = await supabase
        .from("wishlist")
        .select(`
          product_id,
          products (
            id,
            name,
            image_url,
            original_price,
            current_price,
            rating,
            review_count,
            stock,
            is_popular,
            demand_level
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      const products = wishlistData?.map(item => ({
        id: item.products.id,
        name: item.products.name,
        image_url: item.products.image_url,
        original_price: Number(item.products.original_price),
        current_price: Number(item.products.current_price),
        rating: Number(item.products.rating),
        review_count: item.products.review_count,
        stock: item.products.stock,
        is_popular: item.products.is_popular,
        demand_level: item.products.demand_level as "high" | "medium" | "low"
      })) || [];

      setWishlistItems(products);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save items you love by clicking the heart icon on products
            </p>
            <Button onClick={() => navigate("/")}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Start Shopping
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image_url}
                originalPrice={product.original_price}
                currentPrice={product.current_price}
                rating={product.rating}
                reviewCount={product.review_count}
                stock={product.stock}
                isPopular={product.is_popular}
                demandLevel={product.demand_level}
                onWishlistUpdate={fetchWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;