# 🤖 AI Contacts Extractor - Backend

**Contact extraction API** powered by OpenAI GPT-4.1. Transforming unstructured meeting notes into structured contact information.

[![Built with Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![Hono](https://img.shields.io/badge/Hono-E36002?style=flat&logo=hono&logoColor=white)](https://hono.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🎯 What This Does

Transforms unstructured text into clean, structured contact data:

```
Input: "Today, I had an interview with Dustin & Andrei from HeyGov, their emails are dustin@heygov.com andrei@heygov.com"

Output: [{
  name: "Dustin",
  company: "HeyGov",
  email: "dustin@heygov.com"
}, {
  name: "Andrei",
  company: "HeyGov",
  email: "andrei@heygov.com"
}]
```

## ✨ Features

- 🤖 **AI-Powered Extraction** - OpenAI GPT-4.1 with structured outputs for reliable parsing
- 📝 **OpenAPI Documentation** - Auto-generated API docs with Scalar UI
- 🛠️ **Type-Safe Stack** - End-to-end type safety with TypeScript and Zod validation
- 🚀 **High Performance** - Built on Bun runtime for maximum speed
- 📊 **Structured Output** - Consistent, validated JSON responses
- ✅ **Production Ready** - Comprehensive test suite and error handling
- 🔍 **Smart Validation** - Extracts name, email, phone, company, job title, and dynamic custom fields
- 🛡️ **Robust Error Handling** - Graceful failure handling with meaningful error messages

## 🛠️ Tech Stack

**Core Framework:**
- [Bun](https://bun.sh) - Ultra-fast JavaScript runtime
- [Hono](https://hono.dev) - Lightweight, fast web framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development

**AI & Processing:**
- [OpenAI](https://openai.com) - GPT-4.1 with structured outputs
- [Zod](https://zod.dev) - Runtime type validation and schema definition
- JSON Schema - Structured AI response validation

**API & Documentation:**
- OpenAPI 3.0 - API specification
- [Scalar](https://scalar.com) - Beautiful API documentation UI
- [Vitest](https://vitest.dev) - Fast unit testing framework

**Data & Validation:**
- [Drizzle ORM](https://orm.drizzle.team) - Type-safe database operations
- SQLite - Local development database

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) v1.1.x or higher
- Node.js 18+ (fallback)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/b0g1dan23/ai-contact-extractor.git
cd ai-contact-extractor/backend

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your OpenAI API key and other configuration

# 4. Run database migrations
bun drizzle-kit push

# 5. Start development server
bun run dev
```

### Environment Configuration

Create a `.env` file in the root directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database
DB_URL=file:./local.db

# OpenAI Configuration (Required)
OPENAI_API_KEY=your-openai-api-key-here
```

## 📡 API Endpoints

### Production Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/doc` | OpenAPI JSON specification |
| `GET` | `/reference` | Interactive API documentation |
| `GET` | `/v1` | Welcome screen |
| `POST` | `/v1/extract/text` | **Extract contacts from text** |
| `GET` | `/v1/contacts` | Get all contacts |
| `POST` | `/v1/contacts` | Create a new contact |
| `PUT` | `/v1/contacts/:id` | Update an existing contact |
| `DELETE` | `/v1/contacts/:id` | Delete a contact |

### Extract Contacts

**Endpoint:** `POST /v1/extract/text`

**Request Body:**
```json
{
  "text": "I met John Doe from TechCorp, his email is john.doe@techcorp.com and phone is +1-555-123-4567"
}
```

**Response:**
```json
[
  {
    "name": "John Doe",
    "email": "john.doe@techcorp.com", 
    "phone": "+1-555-123-4567",
    "company": "TechCorp",
    "job_title": null,
    "location": null,
    "custom_fields": []
  }
]
```

**Validation Rules:**
- Text is required (1-10,000 characters)
- Content-Type must be `application/json`
- **At least one contact must have name or email** (enforced at database level)
- **No legacy fields**: `notes` field has been removed from all schemas
- **Custom fields support**: Dynamic key-value pairs for additional contact data

### Contact Management

#### Get All Contacts
**Endpoint:** `GET /v1/contacts`

**Response:**
```json
[
  {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john.doe@techcorp.com",
    "phone": "+1-555-123-4567", 
    "company": "TechCorp",
    "job_title": "Software Engineer",
    "location": "San Francisco",
    "createdAt": 1640995200000,
    "updatedAt": 1640995200000,
    "custom_fields": [
      {
        "id": "field-uuid",
        "label": "LinkedIn",
        "value": "https://linkedin.com/in/johndoe",
        "contact_id": "uuid-here",
        "createdAt": 1640995200000,
        "updatedAt": 1640995200000
      }
    ]
  }
]
```

#### Create New Contact
**Endpoint:** `POST /v1/contacts`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "+1-555-987-6543",
  "company": "StartupCorp",
  "job_title": "Product Manager",
  "location": "New York",
  "custom_fields": [
    {
      "label": "Twitter",
      "value": "@janesmith"
    },
    {
      "label": "Department",
      "value": "Product"
    }
  ]
}
```

**Validation Rules:**
- **At least one of `name` or `email` is required**
- `email` must be valid email format (if provided)
- `phone` must match pattern `^\+?[0-9\s-]+$` (if provided)
- `custom_fields` array is optional
- Each custom field must have `label` and `value` (both required)

#### Update Contact
**Endpoint:** `PUT /v1/contacts/:id`

**Request Body:** (All fields optional)
```json
{
  "name": "Jane Smith Updated",
  "company": "NewCorp"
}
```

#### Delete Contact
**Endpoint:** `DELETE /v1/contacts/:id`

**Response:**
```json
{
  "msg": "Contact deleted successfully"
}
```

## 🏗️ Project Structure

```
src/
├── app.ts              # Main application setup
├── index.ts            # Server entry point
├── env.ts              # Environment validation
├── types.ts            # TypeScript type definitions
├── ai/
│   └── aiConfig.ts     # OpenAI client configuration
├── routes/
│   ├── extract/        # Contact extraction endpoints
│   │   ├── extract.handlers.ts    # Route handlers
│   │   ├── extract.routes.ts      # Route definitions
│   │   ├── extract.types.ts       # Type schemas
│   │   ├── extract.index.ts       # Route exports
│   │   └── extract.test.ts        # Comprehensive tests
│   └── contacts/       # CRUD contact management
│       ├── contacts.handlers.ts   # CRUD route handlers
│       ├── contacts.routes.ts     # CRUD route definitions
│       └── contacts.index.ts      # Route exports
├── db/
│   ├── index.ts        # Database connection
│   ├── schema.ts       # Database schema definitions
│   └── migrations/     # Database migrations
├── helpers/            # Utility functions
├── lib/                # Core application logic
└── middlewares/        # Custom middleware
```

## 🔧 Development

### Available Scripts

```bash
# Development
bun run dev          # Start development server with hot reload
bun run start        # Start production server

# Database
bun drizzle-kit generate  # Generate migrations
bun drizzle-kit push      # Push schema changes
bun drizzle-kit studio    # Open Drizzle Studio

# Testing
bun run test         # Run comprehensive test suite
bun run test:watch   # Run tests in watch mode
```

### Database Management

```bash
# Generate new migration
bun drizzle-kit generate
```

## 📊 API Documentation

Once the server is running, visit:
- **Interactive Docs**: `http://localhost:8080/reference`
- **OpenAPI Spec**: `http://localhost:8080/doc`

## 🧪 Testing

**🚀 Lightning-Fast In-Memory Testing**

Our test suite uses **SQLite in-memory database** for blazing-fast, isolated tests:

```bash
# Run all tests (uses in-memory database)
bun test

# Run with verbose output
bun test --reporter=verbose

# Run specific test
bun test -t "malformed JSON"

# Run specific test file
bun test extract.test.ts      # API and validation tests
bun test extract.db.test.ts   # Database integration tests

# Run tests in watch mode
bun test --watch

# Run with coverage
bun test --coverage
```

**🎯 Test Architecture:**
- **In-Memory Database**: `file::memory:?cache=shared` for fast, isolated tests
- **Automatic Setup**: Database created and migrated before each test suite
- **Complete Isolation**: Each test gets a clean database state
- **CI/CD Ready**: No file dependencies, works in any environment
- **Real API Integration**: Tests actual OpenAI API calls for accuracy

**📊 Comprehensive Coverage:**
- ✅ **Input Validation** (missing fields, empty text, text limits)
- ✅ **Request Validation** (malformed JSON, headers, HTTP methods)
- ✅ **AI Integration** (OpenAI API calls, structured outputs, error handling)
- ✅ **Database Operations** (contact persistence, custom fields, relationships)
- ✅ **Data Consistency** (API response matches database state)
- ✅ **Error Scenarios** (AI failures, network issues, validation errors)

**📈 Test Performance:**
- **21 tests** run in ~15-20 seconds
- **In-memory database** ensures consistent performance
- **Parallel execution** safe with isolated test data
- **Zero file I/O** during testing

## 🛡️ Security & Validation

- **Input Validation**: All requests validated with Zod schemas
- **Database Constraints**: `name OR email` constraint enforced at database level
- **AI Output Validation**: OpenAI responses validated against strict schemas
- **Comprehensive Error Handling**: 
  - ✅ Validation errors with detailed messages
  - ✅ Database constraint violations  
  - ✅ Network and AI service failures
  - ✅ Proper HTTP status codes (200, 422, 500)
- **CORS**: Configurable cross-origin resource sharing
- **Type Safety**: End-to-end TypeScript with runtime validation
- **Schema Evolution**: Clean removal of legacy fields (`notes` removed)

## 🔧 Error Handling

The API provides structured error responses:

**Validation Errors (422):**
```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "invalid_type",
        "path": ["email"],
        "message": "Required"
      }
    ],
    "name": "ZodError"
  }
}
```

**Business Logic Errors (422):**
```json
{
  "error": "At least one of name or email must be provided"
}
```

**Server Errors (500):**
```json
{
  "error": "Failed to create contact"
}
```

## 🚦 Status

**✅ Production Ready - All Core Features Implemented**

**✅ Completed:**
- ✅ Modern TypeScript backend with Bun + Hono framework
- ✅ OpenAI GPT-4.1 integration with structured outputs
- ✅ Complete contact extraction API (`POST /extract/text`)
- ✅ **Full CRUD contact management** (`GET`, `POST`, `PUT`, `DELETE /contacts`)
- ✅ Database integration with automatic contact persistence
- ✅ Custom fields support with proper relationships
- ✅ **Database-level constraints** (name OR email required)
- ✅ **Comprehensive error handling** with proper HTTP status codes
- ✅ **Schema cleanup** - removed legacy `notes` field everywhere
- ✅ Comprehensive Zod validation and type safety
- ✅ OpenAPI documentation with Scalar UI
- ✅ **Lightning-fast in-memory testing** (21+ comprehensive tests)
- ✅ Robust error handling and structured logging
- ✅ Clean, production-ready codebase (100% self-documenting)
- ✅ CI/CD ready with zero file dependencies

**🎯 Ready for:**
- ✅ Frontend integration
- ✅ Docker containerization
- ✅ CI/CD pipeline setup
- ✅ Production deployment

**💡 Future Enhancements:**
- 📊 Authentication and rate limiting
- 📈 Analytics and usage metrics
- � Advanced search and filtering for contacts
- 📤 Bulk contact import/export functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Links

- [API Documentation](http://localhost:8080/reference) (when running locally)
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Hono Documentation](https://hono.dev/docs)
- [Zod Documentation](https://zod.dev)
- [Vitest Documentation](https://vitest.dev)

---

**Built with ❤️ using modern TypeScript stack**

## 🌐 CORS Configuration

CORS (Cross-Origin Resource Sharing) is enabled for API routes to allow frontend applications (e.g., React, Vite, etc.) to communicate with the backend securely during development and production.

### How CORS is Configured

- CORS is configured in `src/lib/configure-cors.ts` using the Hono CORS middleware.
- Only requests from allowed origins (e.g., `http://localhost:5173`, `http://localhost:4173`) are permitted by default.
- The CORS middleware is applied to all `/v1/*` routes.

**Example:**
```typescript
import configureCORS from './lib/configure-cors';

const app = createApp();
configureCORS(app); // <-- Add this before defining your routes
```

**To allow your frontend to access the backend:**
- Make sure your frontend's URL is in the `allowedOrigins` array in `configure-cors.ts`.
- If you need to allow additional origins, add them to the array.
- For production, set the allowed origins to your deployed frontend domain(s).

**CORS Troubleshooting:**
- If you see CORS errors in the browser, check that the origin matches exactly (including protocol and port).
- Ensure the CORS middleware is called before your route definitions in `app.ts`.
- For local development, you can temporarily allow all origins by setting `origin: '*'` (not recommended for production).
