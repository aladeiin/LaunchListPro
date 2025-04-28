import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, Users, Award, Stethoscope, ChevronRight } from "lucide-react";

interface DiscussionCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
    isVerified?: boolean;
  };
  category: string;
  tags: string[];
  replies: number;
  likes: number;
  createdAt: string;
}

export default function CommunityDiscussionCard({
  id,
  title,
  excerpt,
  author,
  category,
  tags,
  replies,
  likes,
  createdAt
}: DiscussionCardProps) {
  const [, setLocation] = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2">
              {category}
            </Badge>
            <CardTitle className="text-lg font-bold line-clamp-2">
              {title}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="flex items-center gap-1 mt-1">
          <Users className="h-3 w-3" />
          <span>Community Discussion</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(author.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium">{author.name}</p>
              {author.isVerified && (
                <Badge variant="secondary" className="px-1 py-0 h-5">
                  <Stethoscope className="h-3 w-3 mr-1" />
                  <span className="text-xs">Verified</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{author.role}</p>
          </div>
        </div>
        
        <p className="text-sm text-slate-700 line-clamp-3 mb-2">{excerpt}</p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-slate-50">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{replies}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{likes}</span>
          </div>
          <span>{formatDate(createdAt)}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation(`/community/discussion/${id}`)}
        >
          Read More
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}