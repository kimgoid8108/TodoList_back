import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 특정 todo의 모든 subtasks 조회
export const getSubtasksByTodoId = async (req, res) => {
  const { id } = req.params;

  const subtasks = await prisma.subtasks.findMany({
    where: { todo_id: id },
    orderBy: { display_order: "asc" },
  });

  res.status(200).json(subtasks);
};

// subtask 생성
export const createSubtask = async (req, res) => {
  const { id } = req.params;
  const { text, completed, display_order } = req.body;

  // todo 존재 확인
  const todoExists = await prisma.todos.findUnique({
    where: { id },
  });

  if (!todoExists) {
    return res.status(404).json({
      error: "Not Found",
      message: "Todo를 찾을 수 없습니다",
    });
  }

  const subtask = await prisma.subtasks.create({
    data: {
      todo_id: id,
      text,
      completed,
      display_order,
    },
  });

  res.status(201).json(subtask);
};

// subtask 수정
export const updateSubtask = async (req, res) => {
  const { id } = req.params;

  const subtask = await prisma.subtasks.update({
    where: { id },
    data: req.body,
  });

  res.status(200).json(subtask);
};

// subtask 삭제
export const deleteSubtask = async (req, res) => {
  const { id } = req.params;

  await prisma.subtasks.delete({
    where: { id },
  });

  res.status(204).send();
};

// subtask 완료 토글
export const toggleSubtaskComplete = async (req, res) => {
  const { id } = req.params;

  const currentSubtask = await prisma.subtasks.findUnique({
    where: { id },
  });

  if (!currentSubtask) {
    return res.status(404).json({
      error: "Not Found",
      message: "Subtask를 찾을 수 없습니다",
    });
  }

  const subtask = await prisma.subtasks.update({
    where: { id },
    data: { completed: !currentSubtask.completed },
  });

  res.status(200).json(subtask);
};
