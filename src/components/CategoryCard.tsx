import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  image: string;
  trending?: boolean;
  itemCount?: number;
  onClick: () => void;
}

const CategoryCard = ({ 
  title, 
  description, 
  icon: Icon, 
  image, 
  trending = false, 
  itemCount,
  onClick 
}: CategoryCardProps) => {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lifted hover:scale-105 transform bg-gradient-card border-0 overflow-hidden"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Trending Badge */}
        {trending && (
          <Badge className="absolute top-3 right-3 bg-warning text-warning-foreground animate-bounce-subtle">
            🔥 Trending
          </Badge>
        )}
        
        {/* Icon */}
        <div className="absolute top-3 left-3 p-2 bg-background/90 rounded-lg backdrop-blur-sm">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-light transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm opacity-90 mb-2">{description}</p>
          {itemCount && (
            <p className="text-xs opacity-75">{itemCount} items available</p>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Explore Collection
          </span>
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Icon className="w-3 h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;