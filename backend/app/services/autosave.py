import json
from datetime import datetime
from typing import Dict, Any

class AutoSaveService:
    @staticmethod
    def create_auto_save_data(answers: Dict[str, Any], timestamp: datetime = None) -> Dict[str, Any]:
        """Create auto-save data structure"""
        if timestamp is None:
            timestamp = datetime.utcnow()
        
        return {
            "answers": answers,
            "timestamp": timestamp.isoformat(),
            "version": "1.0"
        }
    
    @staticmethod
    def should_auto_save(last_save_time: datetime, current_time: datetime, min_interval: int = 30) -> bool:
        """Determine if auto-save should trigger based on time interval"""
        time_diff = (current_time - last_save_time).total_seconds()
        return time_diff >= min_interval