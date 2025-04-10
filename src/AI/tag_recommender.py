from typing import List, Dict, Set
from .constants import TAG_RULES
from .health_analyzer import HealthAnalyzer

class TagRecommender:
    def __init__(self):
        self.health_analyzer = HealthAnalyzer()
        self.tag_rules = TAG_RULES

    async def get_recommended_tags(self, health_info: str, illness: str, all_tags: List[Dict]) -> Dict:
        """
        Trả về danh sách các tag được đề xuất và loại bỏ
        """
        # Phân tích điều kiện sức khỏe
        health_conditions = self.health_analyzer.analyze_health_info(health_info, illness)

        excluded_tags = set()
        recommended_tags = set()

        # Áp dụng các quy tắc cho từng điều kiện sức khỏe
        for condition in health_conditions:
            if condition in self.tag_rules:
                excluded_tags.update(self.tag_rules[condition]['exclude'])
                recommended_tags.update(self.tag_rules[condition]['recommend'])

        # Lọc các tag từ database
        filtered_tags = []
        excluded_tag_ids = []

        for tag in all_tags:
            tag_name = tag.get('tag_name', '').lower()
            if any(excluded in tag_name for excluded in excluded_tags):
                excluded_tag_ids.append(tag['tag_id'])
            elif any(recommended in tag_name for recommended in recommended_tags):
                filtered_tags.append(tag)

        return {
            'recommended_tags': filtered_tags,
            'excluded_tag_ids': excluded_tag_ids,
            'health_conditions': health_conditions
        } 