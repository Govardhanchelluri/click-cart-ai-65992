import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Zap,
  TrendingUp,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  currentPrice: number;
  rating: number;
  reviewCount: number;
  stock: number;
  isPopular?: boolean;
  demandLevel?: "high" | "medium" | "low";
  timeOfDay?: "morning" | "afternoon" | "evening";
  onWishlistUpdate?: () => void;
}

const ProductCard = ({
  id,
  name,
  image,
  originalPrice,
  currentPrice,
  rating,
  reviewCount,
  stock,
  isPopular = false,
  demandLevel = "medium",
  timeOfDay = "afternoon",
  onWishlistUpdate
}: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkWishlistStatus();
  }, [id]);

  const checkWishlistStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", id)
        .maybeSingle();

      setIsWishlisted(!!data);
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  // AI Dynamic Pricing Logic
  const calculateDynamicPrice = () => {
    let adjustedPrice = originalPrice;
    
    // Demand-based adjustment
    if (demandLevel === "high") adjustedPrice *= 1.05;
    else if (demandLevel === "low") adjustedPrice *= 0.95;
    
    // Time-based adjustment
    if (timeOfDay === "evening") adjustedPrice *= 0.98; // Evening discounts
    
    // Stock-based adjustment
    if (stock < 10) adjustedPrice *= 1.02; // Low stock premium
    
    return Math.round(adjustedPrice);
  };

  const dynamicPrice = calculateDynamicPrice();
  const discount = originalPrice > dynamicPrice ? 
    Math.round(((originalPrice - dynamicPrice) / originalPrice) * 100) : 0;
  const priceIncrease = dynamicPrice > originalPrice ? 
    Math.round(((dynamicPrice - originalPrice) / originalPrice) * 100) : 0;

  const getStockColor = () => {
    if (stock < 10) return "text-stock-low";
    if (stock < 50) return "text-stock-medium";
    return "text-stock-high";
  };

  const getDemandIcon = () => {
    if (demandLevel === "high") return <TrendingUp className="w-3 h-3 text-success" />;
    if (demandLevel === "low") return <Clock className="w-3 h-3 text-muted-foreground" />;
    return null;
  };

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart!",
      description: `${name} has been added to your cart`,
    });
  };

  const handleBuyNow = () => {
    navigate("/cart");
    toast({
      title: "Proceed to Checkout",
      description: "Taking you to cart to complete your purchase",
    });
  };

  const handleWishlist = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to add items to wishlist",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      if (isWishlisted) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", id);

        setIsWishlisted(false);
        toast({
          title: "Removed from Wishlist",
          description: `${name} removed from your wishlist`,
        });
      } else {
        await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: id
          });

        setIsWishlisted(true);
        toast({
          title: "Added to Wishlist!",
          description: `${name} added to your wishlist`,
        });
      }

      onWishlistUpdate?.();
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lifted hover:scale-105 transform bg-gradient-card border-0 overflow-hidden animate-fade-in">
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        {/* Overlays */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isPopular && (
            <Badge className="bg-warning text-warning-foreground animate-bounce-subtle text-xs">
              🔥 Popular
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-success text-success-foreground text-xs">
              {discount}% OFF
            </Badge>
          )}
          {priceIncrease > 0 && (
            <Badge className="bg-destructive text-destructive-foreground text-xs">
              +{priceIncrease}%
            </Badge>
          )}
        </div>
        

        {/* AI Pricing Indicator */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium">AI Priced</span>
          {getDemandIcon()}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${
                  i < Math.floor(rating) 
                    ? "fill-rating-star text-rating-star" 
                    : "text-muted-foreground"
                }`} 
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-foreground">
            ₹{dynamicPrice.toLocaleString()}
          </span>
          {originalPrice !== dynamicPrice && (
            <span className="text-sm text-price-original line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Info */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium ${getStockColor()}`}>
            {stock} in stock
          </span>
          <span className="text-xs text-muted-foreground">
            Demand: {demandLevel}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-2">
          <Button 
            className="flex-1 transition-all duration-300 text-sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Add to Cart
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            disabled={isLoading}
            className={`transition-all duration-300 ${
              isWishlisted 
                ? "bg-error text-error-foreground hover:bg-error/90" 
                : "hover:bg-accent"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleWishlist();
            }}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
        </div>
        <Button 
          className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleBuyNow();
          }}
        >
          <Zap className="w-3 h-3 mr-1" />
          Buy Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;