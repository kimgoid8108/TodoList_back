// Prisma 에러 핸들러
export const prismaErrorHandler = (error, req, res, next) => {
  // Prisma Client 에러 처리
  if (error.code) {
    switch (error.code) {
      case "P2002":
        return res.status(409).json({
          error: "Conflict",
          message: "이미 존재하는 데이터입니다",
        });

      case "P2025":
        return res.status(404).json({
          error: "Not Found",
          message: "요청한 데이터를 찾을 수 없습니다",
        });

      case "P2003":
        return res.status(400).json({
          error: "Foreign Key Constraint",
          message: "관련된 데이터가 존재하지 않습니다",
        });

      case "P2014":
        return res.status(400).json({
          error: "Invalid ID",
          message: "유효하지 않은 ID입니다",
        });

      default:
        console.error("Prisma Error:", error);
        return res.status(500).json({
          error: "Database Error",
          message: "데이터베이스 처리 중 오류가 발생했습니다",
        });
    }
  }

  // 다음 에러 핸들러로 전달
  next(error);
};

// 일반 에러 핸들러
export const generalErrorHandler = (error, req, res, next) => {
  console.error("Unhandled error:", error);

  res.status(error.status || 500).json({
    error: error.name || "Internal Server Error",
    message: error.message || "서버 내부 오류가 발생했습니다",
  });
};

// 404 핸들러
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `경로를 찾을 수 없습니다: ${req.method} ${req.path}`,
  });
};

// 비동기 에러를 catch하는 래퍼
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
