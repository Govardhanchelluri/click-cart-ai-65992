import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Filter, Grid3X3, LayoutGrid, ArrowLeft, TrendingUp } from "lucide-react";

const Category = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", categoryId || "")
        .limit(20);

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
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const categoryInfo = {
    topwear: {
      title: "Top Wear",
      description: "Shirts, T-shirts, Jackets & More",
      subcategories: ["Shirts", "T-Shirts", "Jackets", "Hoodies", "Tank Tops"],
      brands: ["Nike", "Adidas", "Puma", "H&M", "Zara", "Uniqlo"]
    },
    bottomwear: {
      title: "Bottom Wear",
      description: "Jeans, Trousers, Shorts & More", 
      subcategories: ["Jeans", "Trousers", "Shorts", "Track Pants", "Cargo"],
      brands: ["Levi's", "Wrangler", "Lee", "Pepe Jeans", "Flying Machine"]
    },
    shoes: {
      title: "Shoes",
      description: "Sneakers, Formal, Sports & More",
      subcategories: ["Sneakers", "Formal Shoes", "Sports Shoes", "Casual", "Sandals"],
      brands: ["Nike", "Adidas", "Puma", "Reebok", "Converse", "Vans"]
    },
    branded: {
      title: "Branded Clothes",
      description: "Premium Brands & Designer Wear",
      subcategories: ["Designer Shirts", "Premium Jeans", "Luxury Accessories", "High-end Footwear"],
      brands: ["Gucci", "Prada", "Armani", "Hugo Boss", "Calvin Klein"]
    },
    groceries: {
      title: "Groceries",
      description: "Fresh Food & Daily Essentials",
      subcategories: ["Fruits & Vegetables", "Dairy", "Snacks", "Beverages", "Household"],
      brands: ["Amul", "Britannia", "Nestle", "Parle", "ITC"]
    },
    electronics: {
      title: "Electronics", 
      description: "Gadgets, Phones & Tech",
      subcategories: ["Smartphones", "Laptops", "Headphones", "Smart Watches", "Cameras"],
      brands: ["Apple", "Samsung", "Sony", "OnePlus", "Xiaomi", "Dell"]
    },
    accessories: {
      title: "Accessories",
      description: "Watches, Bags & Jewelry",
      subcategories: ["Watches", "Bags", "Jewelry", "Sunglasses", "Belts"],
      brands: ["Rolex", "Casio", "Fossil", "Ray-Ban", "Coach"]
    },
    gaming: {
      title: "Gaming",
      description: "Games, Consoles & Accessories",
      subcategories: ["Gaming Consoles", "PC Games", "Gaming Accessories", "VR Headsets"],
      brands: ["Sony", "Microsoft", "Nintendo", "Razer", "Logitech"]
    }
  };

  const currentCategory = categoryInfo[categoryId as keyof typeof categoryInfo];


  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={0} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Button onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      {/* Breadcrumb & Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{currentCategory.title}</h1>
              <p className="text-muted-foreground">{currentCategory.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{products.length} Products</Badge>
                <Badge className="bg-primary/10 text-primary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  AI Priced
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-lg">
                <Button variant="ghost" size="sm" className="px-3">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="px-3">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="space-y-6">
              {/* Subcategories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentCategory.subcategories.map((sub) => (
                    <div key={sub} className="flex items-center space-x-2">
                      <Checkbox id={sub} />
                      <label htmlFor={sub} className="text-sm cursor-pointer">
                        {sub}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Price Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Price Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={50000}
                      min={0}
                      step={500}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹{priceRange[0].toLocaleString()}</span>
                      <span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brands */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brands</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentCategory.brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox 
                        id={brand}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                      />
                      <label htmlFor={brand} className="text-sm cursor-pointer">
                        {brand}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Features */}
              <Card className="bg-gradient-hero border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    🔥 High demand in your area
                  </p>
                  <p className="text-muted-foreground">
                    📈 Prices trending up this week
                  </p>
                  <p className="text-muted-foreground">
                    ⚡ Best time to buy: Evening
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found in this category</p>
              </div>
            )}

            {/* Load More */}
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                className="hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Load More Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;