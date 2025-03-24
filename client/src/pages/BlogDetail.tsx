import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { BlogArticle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar, User, ExternalLink } from "lucide-react";
import { marked } from 'marked';

// Initialize marked with GitHub Flavored Markdown
marked.setOptions({
  gfm: true,
  breaks: true
});

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch blog article by slug
  const {
    data: articleData,
    isLoading,
    error
  } = useQuery<{ article: BlogArticle }>({
    queryKey: ["/api/blog/slug", slug],
    queryFn: () => 
      fetch(`/api/blog/slug/${encodeURIComponent(slug)}`).then(res => {
        if (!res.ok) throw new Error("Article not found");
        return res.json();
      }),
    retry: false
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

  // Convert markdown to HTML
  const renderMarkdown = (content: string) => {
    const rawHtml = marked.parse(content);
    return { __html: rawHtml };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !articleData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, the article you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    );
  }

  const { article } = articleData;

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

      {/* Article header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span>{article.author}{article.authorTitle ? `, ${article.authorTitle}` : ''}</span>
          </div>
          <div className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            <a 
              href={article.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary underline transition-colors"
            >
              {article.source}
            </a>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {article.topics.map((topic) => (
            <Link key={topic} href={`/blog/topic/${encodeURIComponent(topic)}`}>
              <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">
                {topic}
              </Badge>
            </Link>
          ))}
        </div>
        
        <p className="text-xl text-gray-700 font-medium mb-6">
          {article.summary}
        </p>
      </div>

      {/* Article content */}
      <div className="prose prose-green lg:prose-lg max-w-none mb-10">
        <div dangerouslySetInnerHTML={renderMarkdown(article.content)} />
      </div>

      {/* Source citation */}
      <div className="border-t pt-6">
        <p className="text-gray-600 italic">
          Source: <a 
            href={article.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {article.source}
          </a>
        </p>
      </div>

      {/* Related content section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Continue Reading</h2>
        <Button asChild>
          <Link href="/blog">View All Articles</Link>
        </Button>
      </div>
    </div>
  );
}