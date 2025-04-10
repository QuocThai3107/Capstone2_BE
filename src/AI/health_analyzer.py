from typing import List, Dict
import re
from .constants import HEALTH_KEYWORDS

class HealthAnalyzer:
    def __init__(self):
        self.health_keywords = HEALTH_KEYWORDS

    def analyze_health_info(self, health_info: str, illness: str) -> List[str]:
        """
        Phân tích thông tin sức khỏe và bệnh tật
        """
        combined_info = f"{health_info} {illness}".lower()
        health_conditions = []

        for condition, keywords in self.health_keywords.items():
            for keyword in keywords:
                if keyword.lower() in combined_info:
                    health_conditions.append(condition)
                    break

        return list(set(health_conditions))

    def clean_text(self, text: str) -> str:
        """
        Làm sạch text đầu vào
        """
        if not text:
            return ""
        # Chuyển về chữ thường và loại bỏ dấu câu
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        return text.strip() 