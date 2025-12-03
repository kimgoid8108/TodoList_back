import Joi from "joi";

// Todo 생성 검증
export const createTodoSchema = Joi.object({
  text: Joi.string().required().min(1).max(500).messages({
    "string.empty": "할일 내용을 입력해주세요",
    "string.min": "할일 내용은 최소 1자 이상이어야 합니다",
    "string.max": "할일 내용은 최대 500자까지 입력 가능합니다",
    "any.required": "할일 내용은 필수입니다",
  }),
  date: Joi.date().iso().required().messages({
    "date.base": "올바른 날짜 형식이 아닙니다",
    "date.format": "날짜는 YYYY-MM-DD 형식이어야 합니다",
    "any.required": "날짜는 필수입니다",
  }),
  completed: Joi.boolean().optional().default(false),
  display_order: Joi.number().integer().min(0).optional().default(0).messages({
    "number.base": "순서는 숫자여야 합니다",
    "number.integer": "순서는 정수여야 합니다",
    "number.min": "순서는 0 이상이어야 합니다",
  }),
});

// Todo 수정 검증
export const updateTodoSchema = Joi.object({
  text: Joi.string().min(1).max(500).optional().messages({
    "string.empty": "할일 내용을 입력해주세요",
    "string.min": "할일 내용은 최소 1자 이상이어야 합니다",
    "string.max": "할일 내용은 최대 500자까지 입력 가능합니다",
  }),
  date: Joi.date().iso().optional().messages({
    "date.base": "올바른 날짜 형식이 아닙니다",
    "date.format": "날짜는 YYYY-MM-DD 형식이어야 합니다",
  }),
  completed: Joi.boolean().optional(),
  display_order: Joi.number().integer().min(0).optional().messages({
    "number.base": "순서는 숫자여야 합니다",
    "number.integer": "순서는 정수여야 합니다",
    "number.min": "순서는 0 이상이어야 합니다",
  }),
}).min(1).messages({
  "object.min": "수정할 내용을 입력해주세요",
});

// Todo 순서 변경 검증
export const reorderTodosSchema = Joi.object({
  todos: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().required().messages({
          "number.base": "ID는 숫자여야 합니다",
          "any.required": "ID는 필수입니다",
        }),
        display_order: Joi.number().integer().min(0).required().messages({
          "number.base": "순서는 숫자여야 합니다",
          "number.min": "순서는 0 이상이어야 합니다",
          "any.required": "순서는 필수입니다",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "최소 1개의 할일이 필요합니다",
      "any.required": "할일 목록은 필수입니다",
    }),
});

// Todo 날짜 변경 검증
export const updateTodoDateSchema = Joi.object({
  date: Joi.date().iso().required().messages({
    "date.base": "올바른 날짜 형식이 아닙니다",
    "any.required": "날짜는 필수입니다",
  }),
  display_order: Joi.number().integer().min(0).optional().default(0),
});

// ID 파라미터 검증
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "ID는 숫자여야 합니다",
    "number.integer": "ID는 정수여야 합니다",
    "number.positive": "ID는 양수여야 합니다",
    "any.required": "ID는 필수입니다",
  }),
});

// 날짜 쿼리 검증
export const dateQuerySchema = Joi.object({
  date: Joi.date().iso().optional().messages({
    "date.base": "올바른 날짜 형식이 아닙니다",
  }),
});
