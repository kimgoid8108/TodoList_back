import express from "express";
import cors from "cors";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";

const app = express();
const port = 3000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// Validation Schemas
// ============================================

const todoSchema = Joi.object({
  text: Joi.string().required().min(1).max(500),
  date: Joi.date().iso().required(),
  completed: Joi.boolean().optional(),
  display_order: Joi.number().integer().min(0).optional(),
});

const todoUpdateSchema = Joi.object({
  text: Joi.string().min(1).max(500).optional(),
  date: Joi.date().iso().optional(),
  completed: Joi.boolean().optional(),
  display_order: Joi.number().integer().min(0).optional(),
}).min(1);

const subtaskSchema = Joi.object({
  text: Joi.string().required().min(1).max(500),
  completed: Joi.boolean().optional(),
  display_order: Joi.number().integer().min(0).optional(),
});

const reorderSchema = Joi.object({
  todos: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().required(),
        display_order: Joi.number().integer().min(0).required(),
      })
    )
    .min(1)
    .required(),
});

// ============================================
// TODO Routes
// ============================================

// GET /todos - 모든 todos 조회 (날짜별 필터링 가능)
app.get("/todos", async (req, res) => {
  try {
    const { date } = req.query;

    const where = date ? { date: new Date(date) } : {};

    const todos = await prisma.todos.findMany({
      where,
      include: {
        subtasks: {
          orderBy: { display_order: "asc" },
        },
      },
      orderBy: [{ date: "asc" }, { display_order: "asc" }],
    });

    res.status(200).json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// GET /todos/:id - 특정 todo 조회
app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await prisma.todos.findUnique({
      where: { id: parseInt(id) },
      include: {
        subtasks: {
          orderBy: { display_order: "asc" },
        },
      },
    });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.status(200).json(todo);
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// POST /todos - 새 todo 생성
app.post("/todos", async (req, res) => {
  try {
    const { error, value } = todoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { text, date, completed = false, display_order = 0 } = value;

    const todo = await prisma.todos.create({
      data: {
        text,
        date: new Date(date),
        completed,
        display_order,
      },
      include: {
        subtasks: true,
      },
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// PUT /todos/:id - todo 수정
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = todoUpdateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updateData = { ...value };
    if (value.date) {
      updateData.date = new Date(value.date);
    }

    const todo = await prisma.todos.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        subtasks: {
          orderBy: { display_order: "asc" },
        },
      },
    });

    res.status(200).json(todo);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Todo not found" });
    }
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// DELETE /todos/:id - todo 삭제 (subtasks도 CASCADE로 자동 삭제)
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.todos.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Todo not found" });
    }
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// PATCH /todos/:id/complete - todo 완료 토글
app.patch("/todos/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    // 현재 todo 조회
    const currentTodo = await prisma.todos.findUnique({
      where: { id: parseInt(id) },
    });

    if (!currentTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // 완료 상태 토글
    const todo = await prisma.todos.update({
      where: { id: parseInt(id) },
      data: { completed: !currentTodo.completed },
      include: {
        subtasks: true,
      },
    });

    res.status(200).json(todo);
  } catch (error) {
    console.error("Error toggling todo completion:", error);
    res.status(500).json({ error: "Failed to toggle todo completion" });
  }
});

// PATCH /todos/reorder - 여러 todo의 순서 변경
app.patch("/todos/reorder", async (req, res) => {
  try {
    const { error, value } = reorderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { todos } = value;

    // 트랜잭션으로 모든 순서 업데이트
    await prisma.$transaction(
      todos.map(({ id, display_order }) =>
        prisma.todos.update({
          where: { id },
          data: { display_order },
        })
      )
    );

    res.status(200).json({ message: "Todos reordered successfully" });
  } catch (error) {
    console.error("Error reordering todos:", error);
    res.status(500).json({ error: "Failed to reorder todos" });
  }
});

// PATCH /todos/:id/date - todo 날짜 변경
app.patch("/todos/:id/date", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, display_order = 0 } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const todo = await prisma.todos.update({
      where: { id: parseInt(id) },
      data: {
        date: new Date(date),
        display_order,
      },
      include: {
        subtasks: true,
      },
    });

    res.status(200).json(todo);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Todo not found" });
    }
    console.error("Error updating todo date:", error);
    res.status(500).json({ error: "Failed to update todo date" });
  }
});

// ============================================
// SUBTASK Routes
// ============================================

// GET /todos/:id/subtasks - 특정 todo의 모든 subtasks 조회
app.get("/todos/:id/subtasks", async (req, res) => {
  try {
    const { id } = req.params;

    const subtasks = await prisma.subtasks.findMany({
      where: { todo_id: parseInt(id) },
      orderBy: { display_order: "asc" },
    });

    res.status(200).json(subtasks);
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    res.status(500).json({ error: "Failed to fetch subtasks" });
  }
});

// POST /todos/:id/subtasks - 새 subtask 생성
app.post("/todos/:id/subtasks", async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = subtaskSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { text, completed = false, display_order = 0 } = value;

    // todo가 존재하는지 확인
    const todoExists = await prisma.todos.findUnique({
      where: { id: parseInt(id) },
    });

    if (!todoExists) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const subtask = await prisma.subtasks.create({
      data: {
        todo_id: parseInt(id),
        text,
        completed,
        display_order,
      },
    });

    res.status(201).json(subtask);
  } catch (error) {
    console.error("Error creating subtask:", error);
    res.status(500).json({ error: "Failed to create subtask" });
  }
});

// PUT /subtasks/:id - subtask 수정
app.put("/subtasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = subtaskSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const subtask = await prisma.subtasks.update({
      where: { id: parseInt(id) },
      data: value,
    });

    res.status(200).json(subtask);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Subtask not found" });
    }
    console.error("Error updating subtask:", error);
    res.status(500).json({ error: "Failed to update subtask" });
  }
});

// DELETE /subtasks/:id - subtask 삭제
app.delete("/subtasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.subtasks.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Subtask not found" });
    }
    console.error("Error deleting subtask:", error);
    res.status(500).json({ error: "Failed to delete subtask" });
  }
});

// PATCH /subtasks/:id/complete - subtask 완료 토글
app.patch("/subtasks/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    // 현재 subtask 조회
    const currentSubtask = await prisma.subtasks.findUnique({
      where: { id: parseInt(id) },
    });

    if (!currentSubtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    // 완료 상태 토글
    const subtask = await prisma.subtasks.update({
      where: { id: parseInt(id) },
      data: { completed: !currentSubtask.completed },
    });

    res.status(200).json(subtask);
  } catch (error) {
    console.error("Error toggling subtask completion:", error);
    res.status(500).json({ error: "Failed to toggle subtask completion" });
  }
});

// ============================================
// Health Check
// ============================================

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ============================================
// 404 Handler
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ============================================
// Error Handler
// ============================================

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// ============================================
// Server Start
// ============================================

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
