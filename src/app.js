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

// CORS 디버깅 로그
console.log("🌐 CORS Configuration:");
console.log("  FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("  Allowed Origins:", allowedOrigins);
console.log("  NODE_ENV:", process.env.NODE_ENV);

app.use(
  cors({
    origin: (origin, callback) => {
      // CORS 요청 로그
      console.log(`🔍 CORS Request from origin: ${origin || "no origin"}`);

      // 개발 환경 또는 origin이 없으면 허용 (Postman 등)
      if (!origin || process.env.NODE_ENV === "development") {
        console.log("✅ CORS allowed (development or no origin)");
        return callback(null, true);
      }

      // 허용된 origin인지 확인
      if (allowedOrigins.includes(origin) || process.env.FRONTEND_URL === "*") {
        console.log("✅ CORS allowed (in allowed list)");
        return callback(null, true);
      }

      console.log("❌ CORS blocked:", origin);
      console.log("   Allowed origins:", allowedOrigins);
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
