from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.exam import Exam, ExamCreate, ExamUpdate, ExamWithQuestions
from app.schemas.user import User
from app.crud.exam import create_exam, get_exams, get_exam_with_questions, update_exam, delete_exam

router = APIRouter()

@router.get("/", response_model=List[Exam])
def read_exams(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exams = get_exams(db, skip=skip, limit=limit)
    return exams

@router.post("/", response_model=Exam)
def create_new_exam(
    exam: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_exam(db, exam, current_user.id)

@router.get("/{exam_id}", response_model=ExamWithQuestions)
def read_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        uuid.UUID(exam_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid exam ID format")
    
    exam = get_exam_with_questions(db, exam_id)
    if exam is None:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@router.put("/{exam_id}", response_model=Exam)
def update_existing_exam(
    exam_id: str,
    exam_update: ExamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        uuid.UUID(exam_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid exam ID format")
    
    exam = update_exam(db, exam_id, exam_update)
    if exam is None:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@router.delete("/{exam_id}")
def delete_existing_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        uuid.UUID(exam_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid exam ID format")
    
    if not delete_exam(db, exam_id):
        raise HTTPException(status_code=404, detail="Exam not found")
    
    return {"message": "Exam deleted successfully"}