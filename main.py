from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, List
import os

# ---------------------- SETUP ----------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_consultations.db")
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------- MODELS ----------------------
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class BookingDB(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(50), nullable=False)
    company = Column(String(50), nullable=True)
    message = Column(Text, nullable=True)
    selected_models = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# ---------------------- SCHEMAS ----------------------
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    class Config:
        orm_mode = True

class BookingCreate(BaseModel):
    name: str
    email: str
    business: Optional[str] = None
    message: Optional[str] = None
    selected_models: List[str]

# ---------------------- DB UTILITY ----------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------- ROUTES ----------------------
@app.get("/")
def root():
    return {"message": "API is working!"}

@app.post("/api/register", response_model=UserOut)
def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(UserDB).filter(UserDB.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = pwd_context.hash(user.password)
    new_user = UserDB(name=user.name, email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": db_user.id, "email": db_user.email}

@app.get("/api/all-bookings")
def get_all_bookings(db: Session = Depends(get_db)):
    return db.query(BookingDB).all()


# ✅ Book a consultation
@app.post("/api/book")
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    db_booking = BookingDB(
        name=booking.name,
        email=booking.email,
        company=booking.business,
        message=booking.message,
        selected_models=",".join(booking.selected_models),
    )
    db.add(db_booking)
    db.commit()
    return {"message": "Booking saved!"}

# ✅ Dashboard summary
@app.get("/api/bookings/summary")
def bookings_summary(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)

    today_start = datetime.combine(today, datetime.min.time())
    week_start_dt = datetime.combine(week_start, datetime.min.time())
    month_start_dt = datetime.combine(month_start, datetime.min.time())

    return {
        "total": db.query(func.count(BookingDB.id)).scalar(),
        "today": db.query(func.count(BookingDB.id)).filter(BookingDB.created_at >= today_start).scalar(),
        "week": db.query(func.count(BookingDB.id)).filter(BookingDB.created_at >= week_start_dt).scalar(),
        "month": db.query(func.count(BookingDB.id)).filter(BookingDB.created_at >= month_start_dt).scalar(),
    }
