import { Router } from "express";
import type { Request, Response } from "express";
import { storage } from "../storage";

export const blogRouter = Router();

/**
 * GET /api/blog
 * Get all blog articles
 */
blogRouter.get("/", async (req: Request, res: Response) => {
  try {
    const articles = await storage.getBlogArticles();
    res.json({ articles });
  } catch (error) {
    console.error("Error fetching blog articles:", error);
    res.status(500).json({ message: "Failed to fetch blog articles" });
  }
});

/**
 * GET /api/blog/:id
 * Get a specific blog article by ID
 */
blogRouter.get("/id/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }
    
    const article = await storage.getBlogArticleById(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    res.json({ article });
  } catch (error) {
    console.error("Error fetching blog article by ID:", error);
    res.status(500).json({ message: "Failed to fetch blog article" });
  }
});

/**
 * GET /api/blog/slug/:slug
 * Get a specific blog article by slug
 */
blogRouter.get("/slug/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const article = await storage.getBlogArticleBySlug(slug);
    
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    res.json({ article });
  } catch (error) {
    console.error("Error fetching blog article by slug:", error);
    res.status(500).json({ message: "Failed to fetch blog article" });
  }
});

/**
 * GET /api/blog/topic/:topic
 * Get blog articles by topic
 */
blogRouter.get("/topic/:topic", async (req: Request, res: Response) => {
  try {
    const topic = req.params.topic;
    const articles = await storage.getBlogArticlesByTopic(topic);
    
    res.json({ articles });
  } catch (error) {
    console.error("Error fetching blog articles by topic:", error);
    res.status(500).json({ message: "Failed to fetch blog articles" });
  }
});

/**
 * GET /api/blog/search
 * Search blog articles
 */
blogRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const articles = await storage.searchBlogArticles(query);
    res.json({ articles });
  } catch (error) {
    console.error("Error searching blog articles:", error);
    res.status(500).json({ message: "Failed to search blog articles" });
  }
});

export default blogRouter;