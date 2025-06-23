import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiRoutes } from "./routes/ai";
import { aiImageRoutes } from "./routes/ai-image";
import { peerRecommendationsRoutes } from "./routes/peer-recommendations";
import { researchRoutes } from "./routes/research";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.use("/api/ai", aiRoutes);
  app.use("/api/ai", aiImageRoutes);
  app.use("/api/peer-recommendations", peerRecommendationsRoutes);
  app.use("/api/research", researchRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
