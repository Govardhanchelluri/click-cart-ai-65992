import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search } from "lucide-react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchProducts();
  }, [query]);

  const searchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${query}%,category.ilike.%${query}%,subcategory.ilike.%${query}%`)
        .limit(50);

      if (error) throw error;

      if (data) {
        const formattedProducts = data.map(product => ({
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
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <Search className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Search Results</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              Showing results for: <span className="font-semibold text-foreground">"{query}"</span>
            </p>
            <Badge variant="secondary">{products.length} Products Found</Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div 
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No products found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find any products matching "{query}". 
                Try searching with different keywords.
              </p>
              <Button onClick={() => navigate("/")}>
                Browse All Products
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
