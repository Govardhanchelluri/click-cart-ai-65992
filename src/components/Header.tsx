import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ShoppingBag, 
  Sparkles, 
  Search, 
  ShoppingCart, 
  User, 
  LogOut, 
  Heart,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import HelpCenterDialog from "./HelpCenterDialog";

interface HeaderProps {
  cartItemCount?: number;
}

const Header = ({ cartItemCount = 0 }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [username, setUsername] = useState("User");
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsername();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsername = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/auth");
  };

  const fetchSearchSuggestions = async (query: string) => {
    if (!query.trim()) {
      // Show default category suggestions for new/empty searches
      setSuggestions(["Shoes", "Slippers", "Shirts", "Jeans", "Electronics", "Accessories"]);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch browsing history
      const { data: history } = await supabase
        .from("browsing_history")
        .select("category, search_query")
        .eq("user_id", user.id)
        .order("visited_at", { ascending: false })
        .limit(5);

      const historySuggestions = history
        ?.map(h => h.search_query || h.category)
        .filter(s => s && s.toLowerCase().includes(query.toLowerCase())) || [];

      // Combine with default categories
      const allSuggestions = [...new Set([
        ...historySuggestions,
        ...["Shoes", "Slippers", "Shirts", "Jeans", "Electronics"].filter(
          c => c.toLowerCase().includes(query.toLowerCase())
        )
      ])];

      setSuggestions(allSuggestions.slice(0, 6));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
    if (!searchQuery) {
      fetchSearchSuggestions("");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    fetchSearchSuggestions(value);
    setShowSuggestions(true);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("browsing_history").insert({
          user_id: user.id,
          search_query: query,
          visited_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error saving search:", error);
    }

    setShowSuggestions(false);
    setSearchQuery("");
    
    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <ShoppingBag className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
            <Sparkles className="w-6 h-6 text-secondary animate-bounce-subtle" />
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CLICK CART
              </span>
              <span className="text-xs text-muted-foreground -mt-1">AI Enhanced</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={handleSearchFocus}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                className="pl-10 pr-4 w-full transition-all duration-300 focus:shadow-card"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
                    >
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-accent transition-colors duration-300"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-accent transition-colors duration-300"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs animate-scale-in"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Help */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent transition-colors duration-300"
              onClick={() => setHelpDialogOpen(true)}
            >
              <HelpCircle className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-accent transition-colors duration-300">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              className="pl-10 pr-4 w-full"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <HelpCenterDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />
    </header>
  );
};

export default Header;