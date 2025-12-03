# 📋 TodoList Backend API (리팩토링 버전)

체계적인 컴포넌트 구조로 개선된 Express + Prisma + PostgreSQL REST API

---

## 🏗️ 프로젝트 구조

```
backend/
├── src/
│   ├── config/              # 설정 파일
│   │   └── database.js      # Prisma Client 설정
│   ├── controllers/         # 비즈니스 로직
│   │   ├── todo.controller.js
│   │   └── subtask.controller.js
│   ├── routes/              # API 라우트
│   │   ├── todo.routes.js
│   │   └── subtask.routes.js
│   ├── validators/          # Joi 유효성 검사
│   │   ├── todo.validator.js
│   │   └── subtask.validator.js
│   ├── middleware/          # 미들웨어
│   │   ├── validate.js      # 유효성 검사 미들웨어
│   │   └── errorHandler.js  # 에러 핸들러
│   ├── app.js              # Express 앱 설정
│   └── server.js           # 서버 시작점
├── prisma/
│   └── schema.prisma       # 데이터베이스 스키마
├── index.js                # (기존 파일 - 호환용)
├── package.json
└── .env

```

---

## ✨ 주요 개선사항

### 1. **관심사의 분리 (Separation of Concerns)**
- **Controllers**: 비즈니스 로직
- **Routes**: 라우트 정의
- **Validators**: 유효성 검사 로직
- **Middleware**: 공통 처리 로직

### 2. **강화된 Joi 검증**
- 한글 에러 메시지
- 상세한 유효성 검사
- 커스텀 검증 규칙

### 3. **향상된 에러 처리**
- Prisma 에러 자동 처리
- 일관된 에러 응답
- 비동기 에러 캐치

### 4. **미들웨어 기반 아키텍처**
- 유효성 검사 자동화
- ID 파라미터 파싱
- 에러 핸들링 통합

---

## 🚀 시작하기

### 1. 의존성 설치 (변경 없음)

```bash
npm install
```

### 2. 환경 변수 설정

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/todolist"
```

### 3. Prisma 설정

```bash
npm run prisma:generate
npm run prisma:push
```

### 4. 서버 실행

```bash
# 개발 모드 (새 구조)
npm run dev

# 프로덕션 모드
npm start
```

---

## 📚 API 엔드포인트 (변경 없음)

### Todo API
- `GET /todos` - 전체 조회
- `GET /todos/:id` - 단일 조회
- `POST /todos` - 생성
- `PUT /todos/:id` - 수정
- `DELETE /todos/:id` - 삭제
- `PATCH /todos/:id/complete` - 완료 토글
- `PATCH /todos/reorder` - 순서 변경
- `PATCH /todos/:id/date` - 날짜 변경

### Subtask API
- `GET /todos/:id/subtasks` - 조회
- `POST /todos/:id/subtasks` - 생성
- `PUT /subtasks/:id` - 수정
- `DELETE /subtasks/:id` - 삭제
- `PATCH /subtasks/:id/complete` - 완료 토글

---

## 🎯 한글 에러 메시지

### Todo 생성 시

```json
// 입력: { "text": "", "date": "invalid" }
// 응답:
{
  "error": "Validation failed",
  "details": [
    {
      "field": "text",
      "message": "할일 내용을 입력해주세요"
    },
    {
      "field": "date",
      "message": "올바른 날짜 형식이 아닙니다"
    }
  ]
}
```

### ID 파라미터 에러

```json
// 요청: GET /todos/abc
// 응답:
{
  "error": "Invalid ID",
  "message": "ID는 양의 정수여야 합니다"
}
```

### Todo 없음

```json
// 요청: GET /todos/999
// 응답:
{
  "error": "Not Found",
  "message": "Todo를 찾을 수 없습니다"
}
```

---

## 🔧 코드 예시

### Controller (비즈니스 로직)

```javascript
// src/controllers/todo.controller.js
export const createTodo = async (req, res) => {
  const { text, date, completed, display_order } = req.body;

  const todo = await prisma.todos.create({
    data: {
      text,
      date: new Date(date),
      completed,
      display_order,
    },
  });

  res.status(201).json(todo);
};
```

### Validator (유효성 검사)

```javascript
// src/validators/todo.validator.js
export const createTodoSchema = Joi.object({
  text: Joi.string().required().min(1).max(500).messages({
    "string.empty": "할일 내용을 입력해주세요",
    "any.required": "할일 내용은 필수입니다",
  }),
  date: Joi.date().iso().required().messages({
    "any.required": "날짜는 필수입니다",
  }),
});
```

### Route (라우트 정의)

```javascript
// src/routes/todo.routes.js
router.post(
  "/",
  validate(createTodoSchema),
  asyncHandler(todoController.createTodo)
);
```

---

## 🛠️ 개발 팁

### 1. 새로운 엔드포인트 추가

```javascript
// 1. Validator 정의
// src/validators/todo.validator.js
export const mySchema = Joi.object({ ... });

// 2. Controller 작성
// src/controllers/todo.controller.js
export const myController = async (req, res) => { ... };

// 3. Route 등록
// src/routes/todo.routes.js
router.post("/path", validate(mySchema), asyncHandler(myController));
```

### 2. 에러 처리

모든 에러는 자동으로 처리됩니다:
- Joi 검증 에러 → 400 Bad Request
- Prisma P2025 → 404 Not Found
- 기타 에러 → 500 Internal Server Error

### 3. 데이터베이스 디버깅

```javascript
// src/config/database.js에서 로그 활성화됨
log: ["query", "error", "warn"]
```

---

## 📊 기존 코드와의 호환성

**기존 `index.js`는 유지**되므로 기존 방식도 계속 사용 가능합니다.

```bash
# 기존 방식
node index.js

# 새 방식
npm run dev
```

---

## 🎉 장점

✅ **유지보수성**: 모듈화된 구조
✅ **확장성**: 새로운 기능 추가 용이
✅ **가독성**: 명확한 책임 분리
✅ **안정성**: 강화된 에러 처리
✅ **개발 경험**: 한글 에러 메시지

---

## 🔜 다음 단계

- [ ] 인증/인가 (JWT)
- [ ] Rate Limiting
- [ ] API 문서 (Swagger)
- [ ] 단위 테스트
- [ ] Docker 설정
