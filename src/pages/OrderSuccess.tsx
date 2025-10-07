import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  Calendar,
  Download,
  Star,
  Heart,
  Zap,
  PartyPopper
} from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [showSuccessDialog, setShowSuccessDialog] = useState(true);

  useEffect(() => {
    // Clear cart on successful order
    localStorage.removeItem("cart");
  }, []);

  const handleDownloadInvoice = () => {
    // Generate invoice data
    const invoiceData = `
CLICK CART - INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: ${orderDetails.orderId}
Date: ${orderDetails.orderDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CUSTOMER DETAILS:
Shipping Address: ${orderDetails.shippingAddress}

ORDER ITEMS:
${orderDetails.items.map(item => `
${item.name}
Quantity: ${item.quantity}
Price: ₹${item.price.toLocaleString()}
Subtotal: ₹${(item.price * item.quantity).toLocaleString()}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL AMOUNT: ₹${orderDetails.total.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Payment Method: ${orderDetails.paymentMethod || 'Online Payment'}
Status: Paid

Expected Delivery: ${orderDetails.estimatedDelivery}

Thank you for shopping with CLICK CART!
AI-Enhanced Shopping Experience
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contact: clickcart@gmail.com
Support: 9898786652
    `.trim();

    // Create and download the invoice
    const blob = new Blob([invoiceData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClickCart_Invoice_${orderDetails.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const orderDetails = {
    orderId: "CC24001",
    orderDate: new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    }),
    estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    items: [
      {
        name: "Premium Cotton Polo Shirt",
        quantity: 1,
        price: 2374,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop"
      },
      {
        name: "Wireless Bluetooth Earbuds Pro", 
        quantity: 2,
        price: 5699,
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=100&h=100&fit=crop"
      }
    ],
    total: 13772,
    shippingAddress: "123 Main Street, Mumbai, Maharashtra 400001",
    paymentMethod: "UPI"
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />

      {/* Success Popup Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <PartyPopper className="w-10 h-10 text-success animate-bounce" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Order Placed Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              🎉 Thank you for shopping with Click Cart! 🎉
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Your order #{orderDetails.orderId} has been confirmed
            </p>
            <Button 
              onClick={() => setShowSuccessDialog(false)}
              className="w-full bg-gradient-primary hover:opacity-90"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground">
            Thank you for shopping with CLICK CART. Your order has been confirmed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Details</span>
                  <Badge className="bg-success text-success-foreground">
                    Confirmed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-semibold">#{orderDetails.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-semibold">{orderDetails.orderDate}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Paid</span>
                  <span>₹{orderDetails.total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Timeline */}
            <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Delivery Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Order Confirmed</h4>
                      <p className="text-sm text-muted-foreground">
                        Your order has been placed and payment confirmed
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">Just now</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        Your items are being prepared for shipment
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">Within 2 hours</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Shipped</h4>
                      <p className="text-sm text-muted-foreground">
                        Your order is on its way to you
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">Tomorrow</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Delivered</h4>
                      <p className="text-sm text-muted-foreground">
                        Expected delivery by {orderDetails.estimatedDelivery}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">{orderDetails.estimatedDelivery}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleDownloadInvoice}
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/orders")}
                  >
                    Track Your Order
                  </Button>
                  
                  <Button 
                    onClick={() => navigate("/")}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Continue Shopping
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {/* Help center logic */}}
                  >
                    Need Help?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{orderDetails.shippingAddress}</p>
                <div className="mt-4 p-3 bg-success/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">Express Delivery</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected by tomorrow evening
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Benefits */}
            <Card className="bg-gradient-hero border-primary/20 animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  AI Benefits Applied
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Dynamic pricing savings</span>
                  <span className="text-success font-medium">₹125</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Smart shipping optimization</span>
                  <span className="text-success font-medium">₹99</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fraud protection</span>
                  <span className="text-primary font-medium">✓ Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Review Reminder */}
            <Card className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-rating-star" />
                  Rate Your Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Help other shoppers by sharing your experience with these products.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/feedback")}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;