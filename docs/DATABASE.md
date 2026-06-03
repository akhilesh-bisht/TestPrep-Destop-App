# Database Schema

SQLite database with WAL journaling and foreign keys enabled.

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| name | TEXT | |
| email | TEXT UNIQUE | |
| password | TEXT | bcrypt hash |
| role | TEXT | `admin` \| `student` |

### tests
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| title | TEXT | |
| description | TEXT | Nullable |
| duration | INTEGER | Minutes |
| total_marks | INTEGER | Sum of question marks |
| is_published | INTEGER | 0 or 1 |
| created_by | INTEGER FK | users.id |

### questions
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| test_id | INTEGER FK | CASCADE delete |
| question | TEXT | |
| option_a–d | TEXT | MCQ options |
| correct_answer | TEXT | A, B, C, or D |
| marks | INTEGER | Default 1 |

### attempts
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| user_id | INTEGER FK | |
| test_id | INTEGER FK | |
| score | REAL | Earned marks |
| total_marks | INTEGER | |
| percentage | REAL | |
| correct_count | INTEGER | |
| incorrect_count | INTEGER | |
| status | TEXT | in_progress, completed, auto_submitted |
| started_at | TEXT | ISO datetime |
| completed_at | TEXT | Nullable |

### answers
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| attempt_id | INTEGER FK | |
| question_id | INTEGER FK | |
| selected_answer | TEXT | Nullable |
| is_correct | INTEGER | 0 or 1 |
