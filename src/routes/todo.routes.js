import express from "express";
import * as todoController from "../controllers/todo.controller.js";
import { validate, parseIdParam } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  createTodoSchema,
  updateTodoSchema,
  reorderTodosSchema,
  updateTodoDateSchema,
  dateQuerySchema,
} from "../validators/todo.validator.js";

const router = express.Router();

// GET /todos - 모든 todos 조회
router.get(
  "/",
  validate(dateQuerySchema, "query"),
  asyncHandler(todoController.getAllTodos)
);

// GET /todos/:id - 특정 todo 조회
router.get(
  "/:id",
  parseIdParam,
  asyncHandler(todoController.getTodoById)
);

// POST /todos - todo 생성
router.post(
  "/",
  validate(createTodoSchema),
  asyncHandler(todoController.createTodo)
);

// PUT /todos/:id - todo 수정
router.put(
  "/:id",
  parseIdParam,
  validate(updateTodoSchema),
  asyncHandler(todoController.updateTodo)
);

// DELETE /todos/:id - todo 삭제
router.delete(
  "/:id",
  parseIdParam,
  asyncHandler(todoController.deleteTodo)
);

// PATCH /todos/:id/complete - todo 완료 토글
router.patch(
  "/:id/complete",
  parseIdParam,
  asyncHandler(todoController.toggleTodoComplete)
);

// PATCH /todos/reorder - todos 순서 변경
router.patch(
  "/reorder",
  validate(reorderTodosSchema),
  asyncHandler(todoController.reorderTodos)
);

// PATCH /todos/:id/date - todo 날짜 변경
router.patch(
  "/:id/date",
  parseIdParam,
  validate(updateTodoDateSchema),
  asyncHandler(todoController.updateTodoDate)
);

export default router;
