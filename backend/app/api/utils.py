import uuid
from typing import Any, List

def validate_uuid(id: str) -> uuid.UUID:
    try:
        return uuid.UUID(id)
    except ValueError:
        raise ValueError(f"Invalid UUID: {id}")