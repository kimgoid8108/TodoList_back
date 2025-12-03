import express from "express";
import * as subtaskController from "../controllers/subtask.controller.js";
import { validate, parseIdParam } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  createSubtaskSchema,
  updateSubtaskSchema,
} from "../validators/subtask.validator.js";

const router = express.Router();

// GET /todos/:id/subtasks - 특정 todo의 모든 subtasks 조회
router.get(
  "/todos/:id/subtasks",
  parseIdParam,
  asyncHandler(subtaskController.getSubtasksByTodoId)
);

// POST /todos/:id/subtasks - subtask 생성
router.post(
  "/todos/:id/subtasks",
  parseIdParam,
  validate(createSubtaskSchema),
  asyncHandler(subtaskController.createSubtask)
);

// PUT /subtasks/:id - subtask 수정
router.put(
  "/subtasks/:id",
  parseIdParam,
  validate(updateSubtaskSchema),
  asyncHandler(subtaskController.updateSubtask)
);

// DELETE /subtasks/:id - subtask 삭제
router.delete(
  "/subtasks/:id",
  parseIdParam,
  asyncHandler(subtaskController.deleteSubtask)
);

// PATCH /subtasks/:id/complete - subtask 완료 토글
router.patch(
  "/subtasks/:id/complete",
  parseIdParam,
  asyncHandler(subtaskController.toggleSubtaskComplete)
);

export default router;
