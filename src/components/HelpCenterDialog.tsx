import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle } from "lucide-react";

interface HelpCenterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HelpCenterDialog = ({ open, onOpenChange }: HelpCenterDialogProps) => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/919898786652", "_blank");
  };

  const handleEmail = () => {
    window.location.href = "mailto:clickcart@gmail.com";
  };

  const handleCall = () => {
    window.location.href = "tel:+919898786652";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Help Center</DialogTitle>
          <DialogDescription>
            Need assistance? We're here to help! Reach out to us through any of the channels below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 bg-gradient-hero rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-3 text-lg">Contact Information</h3>
            
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={handleCall}
              >
                <div className="flex items-start space-x-3 w-full">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div className="text-left">
                    <p className="font-medium">Call Us</p>
                    <p className="text-sm text-muted-foreground">+91 98987 86652</p>
                    <p className="text-xs text-muted-foreground mt-1">Mon-Sat: 9 AM - 6 PM</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={handleWhatsApp}
              >
                <div className="flex items-start space-x-3 w-full">
                  <MessageCircle className="w-5 h-5 text-success mt-1" />
                  <div className="text-left">
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">+91 98987 86652</p>
                    <p className="text-xs text-muted-foreground mt-1">Quick responses 24/7</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={handleEmail}
              >
                <div className="flex items-start space-x-3 w-full">
                  <Mail className="w-5 h-5 text-info mt-1" />
                  <div className="text-left">
                    <p className="font-medium">Email Us</p>
                    <p className="text-sm text-muted-foreground">clickcart@gmail.com</p>
                    <p className="text-xs text-muted-foreground mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 text-sm">For any queries regarding:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Order tracking & delivery</li>
              <li>• Returns & refunds</li>
              <li>• Product information</li>
              <li>• Payment issues</li>
              <li>• Account support</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpCenterDialog;