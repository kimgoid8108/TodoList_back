import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes.js";
import subtaskRoutes from "./routes/subtask.routes.js";
import {
  prismaErrorHandler,
  generalErrorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";

const app = express();

// Middleware
// CORS 설정 - Render 배포 시 프론트엔드 URL 허용
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // 프로덕션에서는 프론트엔드 URL로 변경
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (개발 환경)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/todos", todoRoutes);
app.use("/", subtaskRoutes);

// Error Handlers (순서 중요!)
app.use(notFoundHandler);
app.use(prismaErrorHandler);
app.use(generalErrorHandler);

export default app;
