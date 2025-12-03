import Joi from "joi";

// Subtask 생성 검증
export const createSubtaskSchema = Joi.object({
  text: Joi.string().required().min(1).max(500).messages({
    "string.empty": "세부 작업 내용을 입력해주세요",
    "string.min": "세부 작업 내용은 최소 1자 이상이어야 합니다",
    "string.max": "세부 작업 내용은 최대 500자까지 입력 가능합니다",
    "any.required": "세부 작업 내용은 필수입니다",
  }),
  completed: Joi.boolean().optional().default(false),
  display_order: Joi.number().integer().min(0).optional().default(0).messages({
    "number.base": "순서는 숫자여야 합니다",
    "number.integer": "순서는 정수여야 합니다",
    "number.min": "순서는 0 이상이어야 합니다",
  }),
});

// Subtask 수정 검증
export const updateSubtaskSchema = Joi.object({
  text: Joi.string().min(1).max(500).optional().messages({
    "string.empty": "세부 작업 내용을 입력해주세요",
    "string.min": "세부 작업 내용은 최소 1자 이상이어야 합니다",
    "string.max": "세부 작업 내용은 최대 500자까지 입력 가능합니다",
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
