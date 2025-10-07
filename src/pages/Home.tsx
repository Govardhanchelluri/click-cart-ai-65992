import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shirt, 
  ShoppingBag, 
  Footprints, 
  Crown, 
  Apple, 
  Smartphone,
  Watch,
  Gamepad2,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchTrendingProducts();
    
    // Auto-refresh trending products every 5 minutes
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
      fetchTrendingProducts();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshKey]);

  const fetchTrendingProducts = async () => {
    try {
      // Fetch random products from Supabase
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        // Randomly select 3 products
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(product => ({
          id: product.id,
          name: product.name,
          image: product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
          originalPrice: Number(product.original_price),
          currentPrice: Number(product.current_price),
          rating: Number(product.rating),
          reviewCount: product.review_count,
          stock: product.stock,
          isPopular: product.is_popular,
          demandLevel: product.demand_level as "high" | "medium" | "low"
        }));
        setTrendingProducts(selected);
      }
    } catch (error) {
      console.error("Error fetching trending products:", error);
    }
  };

  const categories = [
    {
      id: "topwear",
      title: "Top Wear",
      description: "Shirts, T-shirts, Jackets & More",
      icon: Shirt,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
      trending: true,
      itemCount: 1250
    },
    {
      id: "bottomwear",
      title: "Bottom Wear", 
      description: "Jeans, Trousers, Shorts & More",
      icon: ShoppingBag,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop",
      itemCount: 890
    },
    {
      id: "shoes",
      title: "Shoes",
      description: "Sneakers, Formal, Sports & More",
      icon: Footprints,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
      trending: true,
      itemCount: 567
    },
    {
      id: "branded",
      title: "Branded Clothes",
      description: "Premium Brands & Designer Wear",
      icon: Crown,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      itemCount: 423
    },
    {
      id: "groceries",
      title: "Groceries",
      description: "Fresh Food & Daily Essentials",
      icon: Apple,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      itemCount: 2340
    },
    {
      id: "electronics",
      title: "Electronics",
      description: "Gadgets, Phones & Tech",
      icon: Smartphone,
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      trending: true,
      itemCount: 1890
    },
    {
      id: "accessories",
      title: "Accessories",
      description: "Watches, Bags & Jewelry",
      icon: Watch,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
      itemCount: 756
    },
    {
      id: "gaming",
      title: "Gaming",
      description: "Games, Consoles & Accessories",
      icon: Gamepad2,
      image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop",
      itemCount: 342
    }
  ];


  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary animate-bounce-subtle" />
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI Enhanced Shopping
              </span>
              <br />
              <span className="text-foreground">Experience</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover smart pricing, personalized recommendations, and the future of e-commerce with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Categories
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                onClick={() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Trending
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose CLICK CART?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of shopping with our AI-powered features
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 bg-gradient-card border-0 shadow-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dynamic Pricing</h3>
              <p className="text-muted-foreground">
                AI-powered pricing that adapts to demand, stock levels, and market trends in real-time.
              </p>
            </Card>
            
            <Card className="text-center p-6 bg-gradient-card border-0 shadow-card">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-muted-foreground">
                Personalized product suggestions based on your browsing history and preferences.
              </p>
            </Card>
            
            <Card className="text-center p-6 bg-gradient-card border-0 shadow-card">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trend Analysis</h3>
              <p className="text-muted-foreground">
                Stay ahead with AI-driven trend insights and popular product highlights.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of products across different categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div 
                key={category.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CategoryCard
                  title={category.title}
                  description={category.description}
                  icon={category.icon}
                  image={category.image}
                  trending={category.trending}
                  itemCount={category.itemCount}
                  onClick={() => handleCategoryClick(category.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section id="trending" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
              <p className="text-muted-foreground">
                Most demanded products with AI-optimized pricing • Updates every 5 minutes
              </p>
            </div>
            <Badge className="bg-warning text-warning-foreground animate-bounce-subtle">
              🔥 Hot Deals
            </Badge>
          </div>
          
          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading trending products...</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="w-6 h-6" />
                <span className="text-xl font-bold">CLICK CART</span>
              </div>
              <p className="text-background/80 text-sm">
                AI-enhanced shopping experience with smart pricing and personalized recommendations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>Top Wear</li>
                <li>Bottom Wear</li>
                <li>Shoes</li>
                <li>Electronics</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Returns</li>
                <li>Shipping Info</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/60">
            <p>&copy; 2024 CLICK CART. All rights reserved. Powered by AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;