import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ShoppingBag, Sparkles, Package, CreditCard, TrendingUp, Tag, Gift, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateUsername = (username: string) => {
    return /\d/.test(username);
  };

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    
    return {
      hasMinLength,
      hasSpecialChar,
      hasUpperCase,
      isValid: hasMinLength && hasSpecialChar && hasUpperCase
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    // Validate username
    if (!validateUsername(formData.username)) {
      newErrors.push("Username must contain at least one number");
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.hasMinLength) {
      newErrors.push("Password must be at least 8 characters long");
    }
    if (!passwordValidation.hasSpecialChar) {
      newErrors.push("Password must contain at least 1 special character (@, #, $, !, etc.)");
    }
    if (!passwordValidation.hasUpperCase) {
      newErrors.push("Password must include at least 1 uppercase letter");
    }

    // Validate confirm password for sign up
    if (!isSignIn && formData.password !== formData.confirmPassword) {
      newErrors.push("Passwords do not match");
    }

    // Validate email for sign up
    if (!isSignIn && !formData.email.includes("@")) {
      newErrors.push("Please enter a valid email address");
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      toast({
        title: isSignIn ? "Welcome back!" : "Account created!",
        description: isSignIn ? "Successfully signed in to CLICK CART" : "Welcome to CLICK CART - AI Enhanced Shopping",
      });
      
      // Simulate successful authentication
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", formData.username);
      
      navigate("/");
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
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Decorative Shopping Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Left Corner */}
        <div className="absolute top-10 left-10 opacity-10 animate-fade-in">
          <Package className="w-20 h-20 text-primary" />
        </div>
        <div className="absolute top-32 left-5 opacity-5">
          <p className="text-4xl font-bold text-primary">CLICK CART</p>
        </div>
        
        {/* Top Right Corner */}
        <div className="absolute top-16 right-10 opacity-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Gift className="w-24 h-24 text-secondary" />
        </div>
        <div className="absolute top-5 right-20 opacity-10 animate-bounce-subtle">
          <Star className="w-12 h-12 text-primary fill-primary" />
        </div>
        
        {/* Left Side */}
        <div className="absolute top-1/3 left-5 opacity-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CreditCard className="w-16 h-16 text-primary" />
        </div>
        <div className="absolute top-1/2 left-16 opacity-5">
          <p className="text-6xl font-bold text-primary">CC</p>
        </div>
        <div className="absolute bottom-1/3 left-8 opacity-10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Tag className="w-14 h-14 text-secondary" />
        </div>
        
        {/* Right Side */}
        <div className="absolute top-1/3 right-10 opacity-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <TrendingUp className="w-18 h-18 text-secondary" />
        </div>
        <div className="absolute top-1/2 right-5 opacity-5">
          <p className="text-5xl font-bold text-secondary">AI SHOP</p>
        </div>
        <div className="absolute bottom-1/3 right-12 opacity-10 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <Zap className="w-16 h-16 text-primary fill-primary" />
        </div>
        
        {/* Bottom Left Corner */}
        <div className="absolute bottom-16 left-10 opacity-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <ShoppingBag className="w-20 h-20 text-primary" />
        </div>
        <div className="absolute bottom-5 left-5 opacity-5">
          <p className="text-3xl font-bold text-primary">SMART SHOPPING</p>
        </div>
        
        {/* Bottom Right Corner */}
        <div className="absolute bottom-20 right-16 opacity-10 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <Package className="w-22 h-22 text-secondary" />
        </div>
        <div className="absolute bottom-8 right-5 opacity-5">
          <p className="text-4xl font-bold text-secondary">DEALS</p>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 opacity-8 animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>
          <Star className="w-8 h-8 text-primary" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 opacity-8 animate-bounce-subtle" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-10 h-10 text-secondary" />
        </div>
      </div>
      
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <Card className="shadow-floating border-0 bg-gradient-card backdrop-blur-sm">
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
                username: "",
                email: "",
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
                    <Label htmlFor="signin-username">Username</Label>
                    <Input
                      id="signin-username"
                      placeholder="Enter username (must contain a number)"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="transition-all duration-300 focus:shadow-card"
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
                  >
                    Sign In to CLICK CART
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      placeholder="Choose username (must contain a number)"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="transition-all duration-300 focus:shadow-card"
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
                  >
                    Create CLICK CART Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="text-center flex-col space-y-3 pt-6">
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
      </div>
    </div>
  );
};

export default Auth;