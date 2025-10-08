import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import upiQrCode from "@/assets/upi-qr-code.jpg";
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  MapPin, 
  Truck, 
  Shield, 
  ArrowLeft,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    upiId: "",
    sameAsBilling: true
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    try {
      const cartStr = localStorage.getItem('shopping_cart');
      if (cartStr) {
        const cart = JSON.parse(cartStr);
        // Transform cart items to order format
        const items = cart.map((item: any) => ({
          id: item.product_id,
          name: item.product_name,
          price: item.price,
          originalPrice: item.original_price,
          quantity: item.quantity,
          image: item.product_image
        }));
        setOrderItems(items);
      } else {
        // Redirect to cart if empty
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      navigate('/cart');
    }
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const originalTotal = orderItems.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0);
  const savings = originalTotal - subtotal;
  const shipping = subtotal > 1000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to place an order",
          variant: "destructive"
        });
        navigate('/auth');
        setIsProcessing(false);
        return;
      }

      // Get cart from localStorage using correct key
      const cartStr = localStorage.getItem('shopping_cart');
      if (!cartStr) {
        toast({
          title: "Cart is Empty",
          description: "Please add items to your cart first",
          variant: "destructive"
        });
        navigate('/');
        setIsProcessing(false);
        return;
      }

      const cart = JSON.parse(cartStr);
      
      if (!Array.isArray(cart) || cart.length === 0) {
        toast({
          title: "Cart is Empty",
          description: "Please add items to your cart first",
          variant: "destructive"
        });
        navigate('/');
        setIsProcessing(false);
        return;
      }

      const orderData = {
        items: cart.map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.pincode,
          phone: formData.phone
        },
        payment_method: formData.paymentMethod,
        payment_transaction_id: formData.paymentMethod === "upi" 
          ? formData.upiId || "UPI_" + Date.now() 
          : formData.paymentMethod === "card"
          ? "CARD_" + Date.now()
          : undefined
      };

      console.log('Submitting order:', orderData);

      const { data, error } = await supabase.functions.invoke('create-order', {
        body: orderData
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Order response:', data);

      if (data?.success) {
        // Clear cart
        localStorage.removeItem('shopping_cart');
        
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${data.order_id.slice(0, 8)} has been confirmed`,
        });

        navigate(`/order-success?orderId=${data.order_id}`);
      } else {
        throw new Error(data?.error || 'Failed to create order');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const PaymentMethodCard = ({ 
    id, 
    title, 
    icon: Icon, 
    description 
  }: { 
    id: string; 
    title: string; 
    icon: any; 
    description: string;
  }) => (
    <Card 
      className={`cursor-pointer transition-all duration-300 ${
        formData.paymentMethod === id 
          ? "border-primary bg-primary/5" 
          : "hover:border-primary/50"
      }`}
      onClick={() => handleInputChange("paymentMethod", id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            formData.paymentMethod === id ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {formData.paymentMethod === id && (
            <CheckCircle className="w-5 h-5 text-primary" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={orderItems.length} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/cart")}
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Checkout</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maharashtra">Maharashtra</SelectItem>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="karnataka">Karnataka</SelectItem>
                          <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        placeholder="400001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <PaymentMethodCard
                      id="card"
                      title="Credit/Debit Card"
                      icon={CreditCard}
                      description="Visa, Mastercard, RuPay"
                    />
                    <PaymentMethodCard
                      id="upi"
                      title="UPI"
                      icon={Smartphone}
                      description="Google Pay, PhonePe, Paytm"
                    />
                    <PaymentMethodCard
                      id="wallet"
                      title="Digital Wallet"
                      icon={Wallet}
                      description="Paytm, Amazon Pay"
                    />
                    <PaymentMethodCard
                      id="cod"
                      title="Cash on Delivery"
                      icon={Wallet}
                      description="Pay when you receive"
                    />
                  </div>

                  {/* Payment Details */}
                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value)}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="nameOnCard">Name on Card</Label>
                        <Input
                          id="nameOnCard"
                          value={formData.nameOnCard}
                          onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === "upi" && (
                    <div className="pt-4 border-t space-y-4">
                      <div>
                        <Label htmlFor="upiId">UPI ID (Optional)</Label>
                        <Input
                          id="upiId"
                          value={formData.upiId}
                          onChange={(e) => handleInputChange("upiId", e.target.value)}
                          placeholder="yourname@paytm"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium mb-3">Or Scan QR Code to Pay</p>
                        <div className="inline-block p-4 bg-white rounded-lg">
                          <img 
                            src={upiQrCode} 
                            alt="UPI QR Code" 
                            className="w-48 h-48 object-contain"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          UPI ID: 9390143685-2@ybl
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === "cod" && (
                    <div className="pt-4 border-t">
                      <div className="p-4 bg-warning/10 rounded-lg">
                        <p className="text-sm font-medium mb-2">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">
                          Pay ₹{total.toLocaleString()} in cash when your order is delivered. 
                          Please keep exact change ready.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Complete Order - ₹${total.toLocaleString()}`
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
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
                  <div className="flex justify-between">
                    <span>Tax (18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
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

                {/* AI Benefits */}
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI Benefits</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Dynamic pricing optimization</li>
                    <li>• Smart delivery route planning</li>
                    <li>• Fraud protection enabled</li>
                  </ul>
                </div>

                {/* Delivery Info */}
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                  <Truck className="w-4 h-4 text-success" />
                  <div className="text-sm">
                    <p className="font-medium text-success">Free Express Delivery</p>
                    <p className="text-muted-foreground">Expected by tomorrow</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;