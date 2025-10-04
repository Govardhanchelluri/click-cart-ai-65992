import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ShoppingBag, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-floating border-0 bg-gradient-card">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <ShoppingBag className="w-8 h-8 text-primary" />
              <Sparkles className="w-6 h-6 text-secondary animate-bounce-subtle" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CLICK CART (CC)
            </CardTitle>
            <CardDescription className="text-base">
              AI Enhanced Shopping Experience
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

          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Join thousands of smart shoppers using AI-powered pricing
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;