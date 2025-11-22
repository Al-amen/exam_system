from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.attempt import  ExamAttemptCreate,ExamAttemptSchema
from app.schemas.user import User
from app.crud.attempt import  get_attempt, update_attempt

router = APIRouter()

@router.post("/", response_model=ExamAttemptSchema)
def start_exam_attempt(
    attempt: ExamAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(403, "Only students can attempt exams")
    
    # Import the SQLAlchemy model
    from app.models.attempt import ExamAttempt as ExamAttemptModel
    
    db_attempt = ExamAttemptModel(
        exam_id=attempt.exam_id,
        student_id=current_user.id,
        start_time=datetime.utcnow(),
        status="in_progress",
        total_score=0
    )
    
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    return db_attempt


@router.post("/{attempt_id}/auto-save")
def auto_save_answers(
    attempt_id: str,
    answers: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = get_attempt(db, attempt_id)
    if not attempt or attempt.student_id != current_user.id:
        raise HTTPException(404, "Attempt not found")
    
    update_attempt(db, attempt_id, {"auto_saved_answers": answers})
    return {"message": "Answers auto-saved successfully"}

@router.post("/{attempt_id}/submit")
def submit_attempt(
    attempt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = get_attempt(db, attempt_id)
    if not attempt or attempt.student_id != current_user.id:
        raise HTTPException(404, "Attempt not found")
    
    update_attempt(db, attempt_id, {
        "end_time": datetime.utcnow(),
        "status": "submitted"
    })
    return {"message": "Exam submitted successfully"}