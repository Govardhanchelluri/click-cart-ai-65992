import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { Star, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Thank you for your feedback!",
        description: "Your review has been submitted successfully",
      });
      setIsSubmitting(false);
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Share Your Experience
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Help us improve by sharing your feedback
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="text-center space-y-3">
                  <Label className="text-lg">Rate Your Experience</Label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-12 h-12 ${
                            star <= (hoveredRating || rating)
                              ? "fill-rating-star text-rating-star" 
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {rating === 0 && "Click to rate"}
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                </div>

                {/* Written Feedback */}
                <div className="space-y-2">
                  <Label htmlFor="feedback">Your Feedback (Optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Tell us more about your experience..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your feedback helps us serve you better
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="mt-6 bg-primary/5">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Why Your Feedback Matters</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Helps other customers make informed decisions</li>
                <li>• Assists us in improving our products and services</li>
                <li>• Contributes to our AI-powered recommendation system</li>
                <li>• Earns you reward points for future purchases</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
