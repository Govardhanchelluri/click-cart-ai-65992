import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft, 
  Heart,
  Zap,
  TrendingUp,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  original_price: number;
  quantity: number;
  stock: number;
  demandLevel?: "high" | "medium" | "low";
}

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const stored = localStorage.getItem('shopping_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('shopping_cart', JSON.stringify(items));
    setCartItems(items);
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    
    const updated = cartItems.map(item =>
      item.product_id === productId 
        ? { ...item, quantity: Math.min(newQuantity, item.stock) } 
        : item
    );
    saveCart(updated);
  };

  const removeItem = (productId: string) => {
    const updated = cartItems.filter(item => item.product_id !== productId);
    saveCart(updated);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const moveToWishlist = async (productId: string) => {
    const item = cartItems.find(item => item.product_id === productId);
    if (!item) return;

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

      await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          product_id: productId
        });

      removeItem(productId);
      toast({
        title: "Moved to wishlist",
        description: `${item.product_name} has been moved to your wishlist`,
      });
    } catch (error) {
      console.error("Error moving to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to move item to wishlist",
        variant: "destructive"
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + (item.original_price * item.quantity), 0);
  const savings = originalTotal - subtotal;
  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shipping;

  const getDemandIcon = (demandLevel: string) => {
    if (demandLevel === "high") return <TrendingUp className="w-3 h-3 text-success" />;
    if (demandLevel === "low") return <Clock className="w-3 h-3 text-muted-foreground" />;
    return null;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={0} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button 
              onClick={() => navigate("/")}
              className="bg-gradient-primary hover:opacity-90"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItems.length} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Shopping Cart</h1>
              <Badge variant="secondary">{cartItems.length} items</Badge>
            </div>

            {cartItems.map((item) => (
              <Card key={item.product_id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-32 h-32 overflow-hidden rounded-lg">
                      <img 
                        src={item.product_image} 
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {item.product_name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.product_id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary">
                          <Zap className="w-3 h-3 mr-1" />
                          AI Priced
                        </Badge>
                        {item.demandLevel && getDemandIcon(item.demandLevel)}
                        {item.demandLevel && (
                          <span className="text-xs text-muted-foreground">
                            {item.demandLevel} demand
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">
                          ₹{item.price.toLocaleString()}
                        </span>
                        {item.original_price > item.price && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{item.original_price.toLocaleString()}
                            </span>
                            <Badge className="bg-success text-success-foreground text-xs">
                              {Math.round(((item.original_price - item.price) / item.original_price) * 100)}% OFF
                            </Badge>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="px-3 py-1 text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.stock} available
                          </span>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveToWishlist(item.product_id)}
                          className="hover:bg-accent"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          Move to Wishlist
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex justify-between text-success">
                      <span>AI Savings</span>
                      <span>-₹{savings.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-success" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  
                  {shipping === 0 && (
                    <p className="text-xs text-success">
                      🎉 You saved ₹99 on shipping!
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                
                {savings > 0 && (
                  <div className="p-3 bg-success/10 rounded-lg">
                    <p className="text-sm text-success font-medium">
                      🎊 You're saving ₹{savings.toLocaleString()} with AI pricing!
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Secure checkout with 256-bit SSL encryption
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;