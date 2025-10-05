import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ShoppingBag, Sparkles, Package, CreditCard, TrendingUp, Tag, Gift, Star, Zap, ShoppingCart, Coins, DollarSign, Percent, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const SHOPPING_QUOTES = [
  "Shopping is the best therapy.",
  "Add to cart, add to happiness.",
  "Smarter shopping starts here.",
  "Buy smart. Live better.",
  "Good deals don't wait — neither should you.",
  "Discover more, spend less with Click Cart.",
  "Your wishlist is calling.",
  "Great finds, better prices.",
];

// Validation schemas
const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters").regex(/\d/, "Username must contain at least one number"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone number must be less than 20 characters").optional(),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least 1 uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least 1 special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const signinSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % SHOPPING_QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const validatedData = signinSchema.parse({
        email: formData.email,
        password: formData.password,
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrors(["Invalid email or password. Please try again."]);
        } else {
          setErrors([error.message]);
        }
        return;
      }

      if (data.session) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to CLICK CART",
        });
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors.map((err) => err.message));
      } else {
        setErrors(["An unexpected error occurred. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const validatedData = signupSchema.parse(formData);

      // Check if username already exists by trying to query profiles
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', validatedData.username)
        .maybeSingle();

      if (existingUsername) {
        setErrors(["Username already taken. Please choose another one."]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validatedData.fullName,
            username: validatedData.username,
            phone_number: validatedData.phone || "",
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setErrors(["Email already registered. Please sign in instead."]);
        } else {
          setErrors([error.message]);
        }
        return;
      }

      if (data.session) {
        toast({
          title: "Account created!",
          description: "Welcome to CLICK CART - AI Enhanced Shopping",
        });
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors.map((err) => err.message));
      } else {
        setErrors(["An unexpected error occurred. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignIn) {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-auth-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Large Glowing Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-orb-1 animate-pulse-glow"></div>
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-orb-2 animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-orb-1 animate-pulse-glow" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Floating 3D Shopping Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Left */}
        <div className="absolute top-10 left-10 animate-float opacity-20" style={{ animationDelay: '0s' }}>
          <ShoppingCart className="w-16 h-16 text-primary" />
        </div>
        <div className="absolute top-32 left-32 animate-float-slow opacity-15" style={{ animationDelay: '1s' }}>
          <Package className="w-20 h-20 text-secondary" />
        </div>
        
        {/* Top Right */}
        <div className="absolute top-20 right-16 animate-float opacity-20" style={{ animationDelay: '0.5s' }}>
          <Gift className="w-24 h-24 text-primary" />
        </div>
        <div className="absolute top-5 right-40 animate-float-slow opacity-15" style={{ animationDelay: '1.5s' }}>
          <Coins className="w-14 h-14 text-secondary" />
        </div>
        
        {/* Left Side */}
        <div className="absolute top-1/3 left-8 animate-float opacity-20" style={{ animationDelay: '2s' }}>
          <Tag className="w-18 h-18 text-primary rotate-12" />
        </div>
        <div className="absolute top-1/2 left-20 animate-float-slow opacity-15" style={{ animationDelay: '2.5s' }}>
          <Percent className="w-16 h-16 text-secondary" />
        </div>
        <div className="absolute bottom-1/3 left-12 animate-float opacity-20" style={{ animationDelay: '3s' }}>
          <CreditCard className="w-20 h-20 text-primary" />
        </div>
        
        {/* Right Side */}
        <div className="absolute top-1/3 right-12 animate-float-slow opacity-20" style={{ animationDelay: '1.2s' }}>
          <DollarSign className="w-22 h-22 text-secondary" />
        </div>
        <div className="absolute top-1/2 right-24 animate-float opacity-15" style={{ animationDelay: '2.8s' }}>
          <Star className="w-16 h-16 text-primary fill-primary" />
        </div>
        <div className="absolute bottom-1/3 right-10 animate-float-slow opacity-20" style={{ animationDelay: '3.5s' }}>
          <TrendingUp className="w-20 h-20 text-secondary" />
        </div>
        
        {/* Bottom Left */}
        <div className="absolute bottom-20 left-16 animate-float opacity-20" style={{ animationDelay: '0.8s' }}>
          <ShoppingBag className="w-24 h-24 text-primary" />
        </div>
        <div className="absolute bottom-10 left-40 animate-float-slow opacity-15" style={{ animationDelay: '3.2s' }}>
          <Package className="w-18 h-18 text-secondary" />
        </div>
        
        {/* Bottom Right */}
        <div className="absolute bottom-24 right-20 animate-float opacity-20" style={{ animationDelay: '1.8s' }}>
          <Gift className="w-20 h-20 text-secondary" />
        </div>
        <div className="absolute bottom-12 right-44 animate-float-slow opacity-15" style={{ animationDelay: '2.2s' }}>
          <Sparkles className="w-16 h-16 text-primary" />
        </div>
        
        {/* AI Sparks */}
        <div className="absolute top-1/4 left-1/3 animate-bounce-subtle opacity-30" style={{ animationDelay: '0.5s' }}>
          <Zap className="w-10 h-10 text-primary fill-primary" />
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-bounce-subtle opacity-30" style={{ animationDelay: '1.5s' }}>
          <Sparkles className="w-12 h-12 text-secondary" />
        </div>
        <div className="absolute top-2/3 left-1/4 animate-bounce-subtle opacity-30" style={{ animationDelay: '2.5s' }}>
          <Star className="w-8 h-8 text-primary fill-primary" />
        </div>
      </div>

      {/* Click Cart Watermark - Large CC Monogram */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="text-[20rem] font-black text-primary/5 select-none animate-spin-slow">
          CC
        </div>
      </div>

      {/* Brand Highlights Around Form */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Left Highlight */}
        <div className="absolute top-24 left-24 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lifted border border-primary/20 animate-fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">AI Smart Deals</span>
          </div>
        </div>
        
        {/* Top Right Highlight */}
        <div className="absolute top-24 right-24 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lifted border border-secondary/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-secondary" />
            <span className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">Instant Checkout</span>
          </div>
        </div>
        
        {/* Bottom Left Highlight */}
        <div className="absolute bottom-24 left-24 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lifted border border-primary/20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">Secure Pay</span>
          </div>
        </div>
        
        {/* Bottom Right Highlight */}
        <div className="absolute bottom-24 right-24 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lifted border border-secondary/20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <span className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">Best Prices</span>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <Card className="shadow-floating border border-primary/10 bg-card/95 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <ShoppingBag className="w-10 h-10 text-primary" />
                <Sparkles className="w-5 h-5 text-secondary animate-bounce-subtle absolute -top-1 -right-1" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                CLICK CART
              </CardTitle>
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <Zap className="w-3 h-3 text-primary" />
                <span>AI-Powered Shopping</span>
                <Star className="w-3 h-3 text-secondary fill-secondary" />
                <span>Best Prices</span>
                <TrendingUp className="w-3 h-3 text-primary" />
              </div>
            </div>
            <CardDescription className="text-base font-medium">
              Join the Future of Smart Shopping
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={isSignIn ? "signin" : "signup"} onValueChange={(value) => {
              setIsSignIn(value === "signin");
              setErrors([]);
              setFormData({
                fullName: "",
                username: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: ""
              });
            }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="transition-all duration-300 focus:shadow-card"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="transition-all duration-300 focus:shadow-card"
                      disabled={loading}
                    />
                  </div>

                  {errors.length > 0 && (
                    <Alert className="border-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In to CLICK CART"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name</Label>
                    <Input
                      id="signup-fullname"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="transition-all duration-300 focus:shadow-card"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      placeholder="Choose username (must contain a number)"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="transition-all duration-300 focus:shadow-card"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="transition-all duration-300 focus:shadow-card"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number (Optional)</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="transition-all duration-300 focus:shadow-card"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create password (8+ chars, 1 uppercase, 1 special)"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="transition-all duration-300 focus:shadow-card"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="transition-all duration-300 focus:shadow-card"
                      disabled={loading}
                    />
                  </div>

                  {errors.length > 0 && (
                    <Alert className="border-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create CLICK CART Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="text-center flex-col space-y-4 pt-6">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Package className="w-4 h-4 text-primary" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="w-4 h-4 text-secondary" />
                <span>Secure Pay</span>
              </div>
              <div className="flex items-center space-x-1">
                <Tag className="w-4 h-4 text-primary" />
                <span>Best Deals</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Join 10,000+ smart shoppers using AI-powered pricing
            </p>
          </CardFooter>
        </Card>

        {/* Rotating Shopping Quote */}
        <div className="mt-8 text-center relative">
          <div className="relative h-12 overflow-hidden">
            {SHOPPING_QUOTES.map((quote, index) => (
              <p
                key={index}
                className={`absolute inset-0 flex items-center justify-center text-lg italic font-medium bg-gradient-primary bg-clip-text text-transparent transition-all duration-700 ${
                  index === currentQuote
                    ? 'opacity-100 translate-y-0'
                    : index === (currentQuote - 1 + SHOPPING_QUOTES.length) % SHOPPING_QUOTES.length
                    ? 'opacity-0 -translate-y-12'
                    : 'opacity-0 translate-y-12'
                }`}
              >
                "{quote}"
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;