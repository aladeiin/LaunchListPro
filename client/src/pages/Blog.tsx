import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BlogArticle } from "@shared/schema";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";

export default function Blog() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // Fetch all blog articles
  const {
    data: articlesData,
    isLoading,
    error,
  } = useQuery<{ articles: BlogArticle[] }>({
    queryKey: ["/api/blog"],
    enabled: true,
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;
    
    queryClient.removeQueries({ queryKey: ["/api/blog/search"] });
    queryClient.prefetchQuery({
      queryKey: ["/api/blog/search", searchQuery],
      queryFn: () => 
        fetch(`/api/blog/search?q=${encodeURIComponent(searchQuery)}`).then(res => 
          res.json()
        ),
    });
    
    navigate(`/blog/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Handle topic filter
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    if (topic) {
      navigate(`/blog/topic/${encodeURIComponent(topic)}`);
    } else {
      navigate("/blog");
    }
  };

  // Get unique topics from all articles
  const allTopics = articlesData?.articles.reduce((acc: string[], article) => {
    article.topics.forEach(topic => {
      if (!acc.includes(topic)) {
        acc.push(topic);
      }
    });
    return acc;
  }, []) || [];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PharmAssist Blog
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stay informed with our latest articles about generic drugs, medication management, and
          healthcare insights to help you make better medical decisions.
        </p>
      </div>

      {/* Search and filter section */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="w-full md:w-64">
          <Select value={selectedTopic} onValueChange={handleTopicChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Topics</SelectItem>
              {allTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic.charAt(0).toUpperCase() + topic.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Articles grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-8">
          Error loading articles. Please try again later.
        </div>
      ) : articlesData?.articles.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          No articles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articlesData?.articles.map((article) => (
            <Card key={article.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold line-clamp-2">
                  <Link href={`/blog/${article.slug}`} className="hover:text-primary transition-colors">
                    {article.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {formatDate(article.publishedAt)} • By {article.author}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3 mb-4">{article.summary}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {article.topics.slice(0, 3).map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {article.topics.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{article.topics.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/blog/${article.slug}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}