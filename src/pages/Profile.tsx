import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Coins, ShoppingBag, TrendingUp, Calendar, Mail, Phone } from "lucide-react";

interface UserProfile {
  full_name: string;
  username: string;
  phone_number: string | null;
}

interface UserRewards {
  coins: number;
  total_spent: number;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rewards, setRewards] = useState<UserRewards>({ coins: 0, total_spent: 0 });
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setEmail(user.email || "");

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch or create rewards
      let { data: rewardsData } = await supabase
        .from("user_rewards")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!rewardsData) {
        const { data: newRewards } = await supabase
          .from("user_rewards")
          .insert({ user_id: user.id, coins: 100, total_spent: 0 })
          .select()
          .single();
        rewardsData = newRewards;
      }

      if (rewardsData) {
        setRewards({
          coins: rewardsData.coins,
          total_spent: Number(rewardsData.total_spent)
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={0} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>

          {/* Profile Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{profile?.full_name || "User"}</CardTitle>
                  <p className="text-muted-foreground">@{profile?.username}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{email}</span>
              </div>
              {profile?.phone_number && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.phone_number}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">ClickCart Coins</CardTitle>
                <Coins className="w-4 h-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">{rewards.coins}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Use coins for discounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <ShoppingBag className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{rewards.total_spent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time purchases
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{rewards.total_spent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getCurrentMonth()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shopping Stats</CardTitle>
                <Badge className="bg-success/10 text-success">Active Member</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Reward Points Earned</p>
                    <p className="text-sm text-muted-foreground">From purchases</p>
                  </div>
                </div>
                <span className="font-bold text-warning">{rewards.coins} coins</span>
              </div>

              <div className="p-4 bg-gradient-hero rounded-lg border border-primary/20">
                <p className="text-sm font-medium mb-2">🎉 Member Benefits</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Earn 10 coins for every ₹100 spent</li>
                  <li>• Exclusive access to AI-powered deals</li>
                  <li>• Free shipping on orders above ₹500</li>
                  <li>• Early access to new product launches</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-6 flex gap-4">
            <Button className="flex-1" onClick={() => navigate("/orders")}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              View Orders
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate("/wishlist")}>
              View Wishlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;