# 🎓 Online Programming Learning Platform - Backend

**A comprehensive web platform for programming education** where teachers conduct personalized lessons with children, track progress, assign homework, and maintain transparent communication with parents.

[![Built with Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![Hono](https://img.shields.io/badge/Hono-E36002?style=flat&logo=hono&logoColor=white)](https://hono.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-C5F74F?style=flat&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![SQLite](https://img.shields.io/badge/SQLite-07405e?style=flat&logo=sqlite&logoColor=white)](https://sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🎯 Platform Overview

A modern educational platform that revolutionizes programming education for children by providing:

- **Interactive Lessons** - Teachers conduct live programming sessions with individual students
- **Smart Homework System** - Automated assignment generation based on lesson content
- **Parent Dashboard** - Complete visibility into child's learning progress and achievements
- **AI-Powered Insights** - Automated lesson summaries and progress analysis
- **Digital Portfolio** - Showcase of student projects, games, and coding achievements
- **Secure Communication** - Transparent messaging between parents and teachers

## 🌟 Key Features

### 👨‍🏫 **Teacher Management**
- **Multi-Teacher Support** - Platform supports multiple teachers with specialized skills
- **Lesson Planning & Recording** - Schedule, conduct, and record programming lessons
- **Smart Note Taking** - Comprehensive lesson documentation and student progress tracking
- **Personalized Goals** - Set individual learning objectives for each student
- **Homework Creation** - Generate targeted assignments based on lesson content
- **Progress Monitoring** - Track student development across multiple programming concepts

### 👶 **Student-Centered Learning**
- **Individual Attention** - One-on-one programming instruction tailored to each child
- **Level-Based Progression** - Beginner to advanced programming skill development
- **Interactive Homework** - Engaging coding assignments with immediate feedback
- **Digital Portfolio** - Personal showcase of projects, websites, games, and achievements
- **Goal Tracking** - Clear learning objectives with measurable progress indicators

### 👨‍👩‍👧‍👦 **Parent Engagement**
- **Complete Transparency** - Full access to lesson recordings and teacher notes
- **Homework Monitoring** - Real-time tracking of assignment progress and completion
- **Detailed Feedback** - View mistakes, corrections, and improvement suggestions
- **AI-Generated Summaries** - Automated insights into lesson content and child participation
- **Direct Communication** - Secure messaging with teachers within the platform
- **Progress Reports** - Comprehensive overview of child's learning journey

### 🤖 **AI-Powered Features**
- **Automatic Lesson Summaries** - AI generates detailed reports covering:
  - Topics covered in the lesson
  - Child's participation level and engagement
  - Strengths and areas of excellence
  - Challenges and areas needing improvement
  - Personalized recommendations for continued learning

### 🔒 **Privacy & Security**
- **Role-Based Access** - Strict data access controls for teachers, parents, and students
- **Secure Communication** - All messages and content remain within the platform
- **Data Protection** - Videos and learning materials accessible only to authorized users
- **Audit Trail** - Complete tracking of all interactions and data access

## 🏗️ System Architecture

### **Database Design**

The platform uses a robust SQLite database with Drizzle ORM, featuring 10 core tables:

#### **User Management**
- **`teachers`** - Teacher profiles, specializations, and credentials
- **`parents`** - Parent information and contact details
- **`children`** - Student profiles linked to parents and primary teachers
- **`teacher_child_assignments`** - Flexible teacher-student relationships

#### **Learning Management**
- **`lessons`** - Lesson scheduling, recordings, notes, and status tracking
- **`lesson_summaries`** - AI-generated lesson insights for parents
- **`homework`** - Assignment creation with difficulty levels and due dates
- **`homework_submissions`** - Student work submissions with file attachments
- **`homework_feedback`** - Teacher reviews with grades and detailed corrections

#### **Communication & Growth**
- **`messages`** - Secure parent-teacher communication system
- **`child_goals`** - Personalized learning objectives with progress tracking
- **`portfolio_items`** - Student project showcase and achievement gallery

## 📚 Core Functionality

### **Lesson Management Workflow**

1. **Pre-Lesson Planning**
   - Teacher schedules lesson with specific child
   - Learning objectives and topics are defined
   - Parent receives lesson notification

2. **During the Lesson**
   - Live programming instruction with screen recording
   - Real-time note taking by teacher
   - Interactive coding exercises and problem-solving

3. **Post-Lesson Processing**
   - Lesson recording is saved and made available
   - Teacher adds comprehensive notes and observations
   - AI generates automated lesson summary
   - Homework is assigned based on lesson content

4. **Parent Review**
   - Access to full lesson recording
   - Review of teacher notes and AI summary
   - Understanding of child's progress and next steps

### **Homework System**

1. **Assignment Creation**
   - Teacher creates homework based on lesson objectives
   - Multiple difficulty levels and estimated completion time
   - Clear instructions and success criteria

2. **Student Submission**
   - Code submissions with syntax highlighting
   - File uploads for projects and documentation
   - Progress tracking and deadline management

3. **Teacher Review & Feedback**
   - Detailed code review with line-by-line comments
   - Identification of mistakes and suggested improvements
   - Grade assignment with comprehensive feedback

4. **Parent Visibility**
   - Complete view of homework assignments and deadlines
   - Access to submitted work and teacher feedback
   - Progress tracking and achievement recognition

### **Portfolio Development**

Students build a comprehensive digital portfolio including:
- **Web Projects** - Personal websites and web applications
- **Games** - Programming games and interactive applications
- **Scripts & Tools** - Utility programs and automation scripts
- **Creative Projects** - Digital art, animations, and multimedia
- **Collaborative Work** - Group projects and peer learning experiences

## 🛠️ Technical Stack

**Runtime & Framework:**
- [Bun](https://bun.sh) - Ultra-fast JavaScript runtime and package manager
- [Hono](https://hono.dev) - Lightweight, performant web framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development environment

**Database & ORM:**
- [SQLite](https://sqlite.org) - Lightweight, serverless database
- [Drizzle ORM](https://orm.drizzle.team) - Type-safe database operations
- **Database Migrations** - Version-controlled schema management

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher
- Node.js v18+ (for compatibility)
- SQLite 3

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/b0g1dan23/online-web-platform.git
   cd online-web-platform/backend
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Generate and run migrations
   bun drizzle-kit push
   bun drizzle-kit generate
   
   # Optional: Seed with sample data
   bun run db:seed
   ```

5. **Start Development Server**
   ```bash
   bun run dev
   ```

The API will be available at `http://localhost:8080`

### Environment Variables

```env
# Database
DB_URL=sqlite:./local.db

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Application
NODE_ENV=development
PORT=8080
```

## 📡 API Endpoints

### Production Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/doc` | OpenAPI JSON specification |
| `GET` | `/reference` | Interactive API documentation |
| `GET` | `/v1` | Welcome screen |

## 🗄️ Database Schema

### Core Tables Overview

```sql
-- User Management
teachers              # Teacher profiles and specializations
parents               # Parent information and contacts
children              # Student profiles and learning levels
teacher_child_assignments  # Many-to-many teacher-student relationships

-- Learning Management
lessons               # Lesson scheduling and recordings
lesson_summaries      # AI-generated lesson insights
homework              # Assignment creation and tracking
homework_submissions  # Student work submissions
homework_feedback     # Teacher reviews and grades

-- Communication & Growth
messages              # Parent-teacher communication
child_goals           # Personalized learning objectives
portfolio_items       # Student project showcase
```

### Key Relationships

- **Parent → Children** (One-to-Many): Parents can have multiple children
- **Teacher → Children** (Many-to-Many): Teachers can work with multiple children, children can have multiple teachers
- **Teacher → Lessons** (One-to-Many): Teachers conduct multiple lessons
- **Child → Lessons** (One-to-Many): Children attend multiple lessons
- **Lesson → Homework** (One-to-Many): Lessons can generate multiple homework assignments
- **Homework → Submissions** (One-to-Many): Multiple submission attempts allowed
- **Submission → Feedback** (One-to-Many): Multiple feedback iterations possible

## 📊 Monitoring & Analytics

### Available Metrics

- **User Activity** - Login frequency, session duration
- **Homework Performance** - Submission rates, grade distribution
- **Portfolio Growth** - Project uploads, skill progression

### Logging

Structured logging with different levels:
- **ERROR** - Application errors and exceptions
- **WARN** - Performance issues and deprecation warnings
- **INFO** - Request/response logging and business events
- **DEBUG** - Detailed debugging information

## 🔒 Security Considerations

### Authentication & Authorization

- **JWT Tokens** - Secure session management
- **Role-Based Access** - Teacher, parent, and admin permissions
- **Data Isolation** - Users can only access their authorized data

### Data Protection

- **Input Validation** - All inputs validated with Zod schemas
- **SQL Injection Prevention** - Parameterized queries with Drizzle ORM
- **File Upload Security** - File type validation and size limits
- **CORS Configuration** - Restricted cross-origin requests

### Privacy Compliance

- **Data Minimization** - Only collect necessary information
- **Access Controls** - Strict data access based on relationships
- **Audit Trail** - Complete logging of data access and modifications
- **Right to Deletion** - Support for data removal requests

### Code Standards

- **TypeScript** - All code must be properly typed
- **ESLint** - Follow established linting rules
- **Prettier** - Code formatting consistency
- **Documentation** - Update README and API docs

### Database Changes

- **Migrations** - All schema changes must include migrations
- **Rollback Support** - Ensure migrations can be safely reverted
- **Data Integrity** - Maintain referential integrity in changes
- **Performance** - Consider index requirements for new queries

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial platform release
- Complete user management system
- Lesson scheduling and recording
- Homework assignment and submission
- Parent dashboard and monitoring
- AI-powered lesson summaries
- Portfolio management
- Secure messaging system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/schema.md)
- [Deployment Guide](./docs/deployment.md)

### Contact
- **Email** - hi@boge.dev

---

**Built with ❤️ for the future of programming education**
