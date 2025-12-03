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
// CORS 설정 - Vercel 프론트엔드 URL 허용
const allowedOrigins = [
  "https://cicd-todolist.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean); // undefined 제거

app.use(
  cors({
    origin: (origin, callback) => {
      // 개발 환경 또는 origin이 없으면 허용 (Postman 등)
      if (!origin || process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      // 허용된 origin인지 확인
      if (allowedOrigins.includes(origin) || process.env.FRONTEND_URL === "*") {
        return callback(null, true);
      }
      callback(new Error("CORS policy violation"));
    },
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
