# 📋 TodoList Backend API

Express + Prisma + PostgreSQL로 구현된 TodoList REST API

---

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 데이터베이스 URL을 설정:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/todolist?schema=public"
```

### 3. Prisma 설정

```bash
# Prisma Client 생성
npm run prisma:generate

# 데이터베이스 스키마 푸시
npm run prisma:push

# 또는 마이그레이션 사용
npm run prisma:migrate
```

### 4. 서버 실행

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 모드
npm start
```

서버가 실행되면 http://localhost:3000 에서 접근 가능합니다.

---

## 📚 API 문서

### Base URL
```
http://localhost:3000
```

### 🔹 Todo Endpoints

#### 1. 모든 Todo 조회
```http
GET /todos
GET /todos?date=2024-12-03
```

**Response:**
```json
[
  {
    "id": 1,
    "text": "프로젝트 완료",
    "date": "2024-12-03T00:00:00.000Z",
    "completed": false,
    "display_order": 0,
    "created_at": "2024-12-03T10:00:00.000Z",
    "updated_at": "2024-12-03T10:00:00.000Z",
    "subtasks": []
  }
]
```

#### 2. 특정 Todo 조회
```http
GET /todos/:id
```

#### 3. Todo 생성
```http
POST /todos
Content-Type: application/json

{
  "text": "새로운 할일",
  "date": "2024-12-03",
  "completed": false,
  "display_order": 0
}
```

#### 4. Todo 수정
```http
PUT /todos/:id
Content-Type: application/json

{
  "text": "수정된 할일",
  "date": "2024-12-04"
}
```

#### 5. Todo 삭제
```http
DELETE /todos/:id
```

#### 6. Todo 완료 토글
```http
PATCH /todos/:id/complete
```

#### 7. Todo 순서 변경
```http
PATCH /todos/reorder
Content-Type: application/json

{
  "todos": [
    { "id": 1, "display_order": 0 },
    { "id": 2, "display_order": 1 },
    { "id": 3, "display_order": 2 }
  ]
}
```

#### 8. Todo 날짜 변경
```http
PATCH /todos/:id/date
Content-Type: application/json

{
  "date": "2024-12-05",
  "display_order": 0
}
```

---

### 🔸 Subtask Endpoints

#### 1. Todo의 모든 Subtask 조회
```http
GET /todos/:id/subtasks
```

#### 2. Subtask 생성
```http
POST /todos/:id/subtasks
Content-Type: application/json

{
  "text": "세부 작업",
  "completed": false,
  "display_order": 0
}
```

#### 3. Subtask 수정
```http
PUT /subtasks/:id
Content-Type: application/json

{
  "text": "수정된 세부 작업",
  "completed": true
}
```

#### 4. Subtask 삭제
```http
DELETE /subtasks/:id
```

#### 5. Subtask 완료 토글
```http
PATCH /subtasks/:id/complete
```

---

### 🏥 Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-12-03T10:00:00.000Z"
}
```

---

## 🔧 Prisma 명령어

```bash
# Prisma Studio (데이터베이스 GUI)
npm run prisma:studio

# 스키마 변경 후 마이그레이션
npm run prisma:migrate

# 스키마를 데이터베이스에 직접 푸시 (개발용)
npm run prisma:push

# Prisma Client 재생성
npm run prisma:generate
```

---

## 📁 프로젝트 구조

```
backend/
├── prisma/
│   └── schema.prisma       # 데이터베이스 스키마
├── index.js               # 메인 서버 파일
├── package.json
├── .env                   # 환경 변수 (git에서 제외)
├── .env.example           # 환경 변수 예시
├── .gitignore
└── README.md
```

---

## 🗄️ 데이터베이스 스키마

### todos 테이블
- `id`: SERIAL (자동 증가)
- `text`: Todo 내용
- `date`: 날짜
- `completed`: 완료 여부
- `display_order`: 표시 순서
- `created_at`: 생성 시간
- `updated_at`: 수정 시간

### subtasks 테이블
- `id`: SERIAL (자동 증가)
- `todo_id`: 외래키 (todos.id)
- `text`: Subtask 내용
- `completed`: 완료 여부
- `display_order`: 표시 순서
- `created_at`: 생성 시간
- `updated_at`: 수정 시간

---

## ✅ 유효성 검사

Joi를 사용한 입력 유효성 검사:

- **text**: 1-500자
- **date**: ISO 날짜 형식 (YYYY-MM-DD)
- **completed**: boolean
- **display_order**: 0 이상의 정수

---

## 🐛 문제 해결

### Prisma Client 에러
```bash
npm run prisma:generate
```

### 데이터베이스 연결 실패
`.env` 파일의 `DATABASE_URL` 확인

### 포트 이미 사용 중
`index.js`에서 `port` 변수 변경

---

## 📝 TODO

- [ ] 인증/인가 (JWT)
- [ ] Rate Limiting
- [ ] API 문서 자동화 (Swagger)
- [ ] 테스트 코드
- [ ] Docker 설정

---

## 🔗 관련 문서

- [Express 공식 문서](https://expressjs.com/)
- [Prisma 공식 문서](https://www.prisma.io/docs/)
- [Joi 공식 문서](https://joi.dev/)
