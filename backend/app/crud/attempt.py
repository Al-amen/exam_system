from sqlalchemy.orm import Session
from app.models.attempt import ExamAttempt


def create_attempt(db: Session, attempt_data: dict):
    # Create the exam attempt from the provided data
    db_attempt = ExamAttempt(
        exam_id=attempt_data["exam_id"],
        student_id=attempt_data["student_id"],
        start_time=attempt_data["start_time"],
        status="in_progress",
        total_score=0
    )
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    return db_attempt

def get_attempt(db: Session, attempt_id: str):
    return db.query(ExamAttempt).filter(ExamAttempt.id == attempt_id).first()

def update_attempt(db: Session, attempt_id: str, updates: dict):
    db_attempt = db.query(ExamAttempt).filter(ExamAttempt.id == attempt_id).first()
    if db_attempt:
        for key, value in updates.items():
            setattr(db_attempt, key, value)
        db.commit()
        db.refresh(db_attempt)
    return db_attempt