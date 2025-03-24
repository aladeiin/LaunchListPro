import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { BlogArticle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Search, BookOpen } from "lucide-react";

export default function Blog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch blog articles
  const {
    data: blogData,
    isLoading,
    error
  } = useQuery<{ articles: BlogArticle[] }>({
    queryKey: ["/api/blog"],
    queryFn: () => fetch("/api/blog").then(res => res.json()),
  });

  // Get unique topics from all articles
  const getUniqueTopics = () => {
    if (!blogData) return [];
    const allTopics = blogData.articles.flatMap(article => article.topics);
    // Create an array of unique topics using object property uniqueness
    const topicSet: Record<string, boolean> = {};
    allTopics.forEach(topic => {
      topicSet[topic] = true;
    });
    return Object.keys(topicSet).sort();
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/blog/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Blog header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center">
          <BookOpen className="h-8 w-8 mr-3 text-primary" />
          PharmAssist Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Reliable information about generic drugs, medication safety, and healthcare insights for Indian patients.
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* Topics */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Topics</h2>
        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            <div className="w-full flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-red-500">Error loading topics</p>
          ) : (
            getUniqueTopics().map((topic) => (
              <Link key={topic} href={`/blog/topic/${encodeURIComponent(topic)}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 py-2 px-3">
                  {topic}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Article list */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-8">
            Error loading articles. Please try again later.
          </div>
        ) : !blogData || blogData.articles.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-gray-50">
            <p className="text-gray-600">No articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogData.articles.map((article) => (
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

      {/* Information box */}
      <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
        <h3 className="text-xl font-bold mb-2">About Our Blog</h3>
        <p className="mb-4">
          Our blog provides reliable information about generic drugs, medicine interactions, and healthcare insights specifically tailored for Indian patients. All content is written by healthcare professionals and verified for accuracy.
        </p>
        <p className="text-sm text-gray-600">
          Disclaimer: The information provided in our blog articles is for educational purposes only and should not be considered as medical advice. Always consult with a qualified healthcare provider for personalized medical guidance.
        </p>
      </div>
    </div>
  );
}