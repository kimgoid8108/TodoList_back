import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 모든 todos 조회
export const getAllTodos = async (req, res) => {
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
};

// 특정 todo 조회
export const getTodoById = async (req, res) => {
  const { id } = req.params;

  const todo = await prisma.todos.findUnique({
    where: { id },
    include: {
      subtasks: {
        orderBy: { display_order: "asc" },
      },
    },
  });

  if (!todo) {
    return res.status(404).json({
      error: "Not Found",
      message: "Todo를 찾을 수 없습니다",
    });
  }

  res.status(200).json(todo);
};

// todo 생성
export const createTodo = async (req, res) => {
  const { text, date, completed, display_order } = req.body;

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
};

// todo 수정
export const updateTodo = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (req.body.date) {
    updateData.date = new Date(req.body.date);
  }

  const todo = await prisma.todos.update({
    where: { id },
    data: updateData,
    include: {
      subtasks: {
        orderBy: { display_order: "asc" },
      },
    },
  });

  res.status(200).json(todo);
};

// todo 삭제
export const deleteTodo = async (req, res) => {
  const { id } = req.params;

  await prisma.todos.delete({
    where: { id },
  });

  res.status(204).send();
};

// todo 완료 토글
export const toggleTodoComplete = async (req, res) => {
  const { id } = req.params;

  const currentTodo = await prisma.todos.findUnique({
    where: { id },
  });

  if (!currentTodo) {
    return res.status(404).json({
      error: "Not Found",
      message: "Todo를 찾을 수 없습니다",
    });
  }

  const todo = await prisma.todos.update({
    where: { id },
    data: { completed: !currentTodo.completed },
    include: {
      subtasks: true,
    },
  });

  res.status(200).json(todo);
};

// todos 순서 변경
export const reorderTodos = async (req, res) => {
  const { todos } = req.body;

  await prisma.$transaction(
    todos.map(({ id, display_order }) =>
      prisma.todos.update({
        where: { id },
        data: { display_order },
      })
    )
  );

  res.status(200).json({ message: "순서가 변경되었습니다" });
};

// todo 날짜 변경
export const updateTodoDate = async (req, res) => {
  const { id } = req.params;
  const { date, display_order } = req.body;

  const todo = await prisma.todos.update({
    where: { id },
    data: {
      date: new Date(date),
      display_order,
    },
    include: {
      subtasks: true,
    },
  });

  res.status(200).json(todo);
};
