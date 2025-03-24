import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { BlogArticle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, Tag } from "lucide-react";

export default function BlogTopic() {
  const { topic } = useParams<{ topic: string }>();
  const decodedTopic = decodeURIComponent(topic);

  // Fetch articles by topic
  const {
    data: topicResults,
    isLoading,
    error
  } = useQuery<{ articles: BlogArticle[] }>({
    queryKey: ["/api/blog/topic", decodedTopic],
    queryFn: () => 
      fetch(`/api/blog/topic/${encodeURIComponent(decodedTopic)}`).then(res => res.json()),
    enabled: !!decodedTopic
  });

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Format topic for display (capitalize first letter)
  const formatTopic = (topic: string) => {
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>

      {/* Topic header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Tag className="h-6 w-6 mr-2 text-primary" />
          Articles about {formatTopic(decodedTopic)}
        </h1>
        <p className="text-gray-600">
          Browse our collection of articles related to {decodedTopic}
        </p>
      </div>

      {/* Topic results */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-8">
          Error loading articles. Please try again later.
        </div>
      ) : !topicResults || topicResults.articles.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-600 mb-4">No articles found for this topic.</p>
          <Button asChild>
            <Link href="/blog">View All Articles</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicResults.articles.map((article) => (
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
                  {article.topics.slice(0, 3).map((topicName) => (
                    <Badge 
                      key={topicName} 
                      variant={topicName === decodedTopic ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {topicName}
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