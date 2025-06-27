# AI Solutions Backend

A FastAPI backend for the AI Solutions consultation platform, handling booking submissions and AI model selection.

## Features

- ✅ **Booking API** - Handle consultation form submissions
- ✅ **Database Integration** - SQLite (development) / PostgreSQL (production)
- ✅ **Form Validation** - Pydantic models with email validation
- ✅ **CORS Support** - Frontend integration ready
- ✅ **Admin Endpoints** - View and manage bookings
- ✅ **Status Management** - Track booking progress
- ✅ **AI Model Integration** - Store selected AI models from frontend

## Project Structure

```
backend/
├── main.py              # FastAPI application
├── database.py          # Database models and configuration
├── run.py              # Startup script
├── requirements.txt    # Python dependencies
├── .env.example       # Environment variables template
├── README.md          # This file
└── ai_consultations.db # SQLite database (created automatically)
```

## Quick Start

### 1. Setup Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your settings (optional for development)
```

### 4. Run the Application

```bash
# Using the startup script (recommended)
python run.py

# Or directly with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Server**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API status and information |
| GET | `/health` | Health check endpoint |
| POST | `/api/book` | Submit consultation booking |
| GET | `/api/bookings` | Get all bookings (admin) |
| GET | `/api/bookings/{id}` | Get specific booking |
| PUT | `/api/bookings/{id}/status` | Update booking status |
| GET | `/api/ai-models` | Get available AI models |

### Booking Submission

```bash
curl -X POST "http://localhost:8000/api/book" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "business": "Tech Startup",
    "message": "Need help with AI chatbot implementation",
    "selected_models": ["chatbot", "pdf-scanner"]
  }'
```

## Database Schema

### Bookings Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String(100) | Customer name |
| email | String(255) | Customer email |
| business | String(255) | Company name (optional) |
| message | Text | Customer message |
| selected_models | Text | JSON array of selected AI models |
| created_at | DateTime | Booking timestamp |
| status | String(50) | Booking status (pending/contacted/completed) |

## Frontend Integration

### Update your frontend booking component:

Replace the existing `booking.tsx` with the improved version provided in `improved-booking.tsx`. Key improvements:

1. **