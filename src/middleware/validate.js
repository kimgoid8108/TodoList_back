// 유효성 검사 미들웨어
export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // 모든 에러 수집
      stripUnknown: true, // 알 수 없는 필드 제거
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    // 검증된 값으로 교체
    req[property] = value;
    next();
  };
};

// ID 파라미터를 정수로 변환하는 미들웨어
export const parseIdParam = (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid ID",
      message: "ID는 양의 정수여야 합니다",
    });
  }

  req.params.id = id;
  next();
};
