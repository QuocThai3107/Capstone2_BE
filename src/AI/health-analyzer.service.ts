import { Injectable } from '@nestjs/common';
import { TagService } from './tag.service';

export interface HealthAnalyzerResponse {
  workout_tags: string[];
  health_info_tags: string[];
  illness_tags: string[];
  message: string;
}

export interface HealthAnalysisResponse {
  recommended_tags: string[];
  exclude_tags: string[];
  message: string;
}

@Injectable()
export class HealthAnalyzerService {
  constructor(private readonly tagService: TagService) {}

  async analyze_health_info(healthInfo: string, illness: string): Promise<HealthAnalyzerResponse> {
    try {
      // Dự đoán tags từ thông tin sức khỏe
      const prediction = await this.tagService.predictTagsFromHealthInfo(healthInfo, illness);
      
      // Tạo message dựa trên kết quả dự đoán
      let message = 'Dựa trên thông tin sức khỏe của bạn, chúng tôi đề xuất các bài tập sau:';
      
      if (prediction.recommendTags.length > 0) {
        message += `\n- Các bài tập phù hợp: ${prediction.recommendTags.join(', ')}`;
      }
      
      if (prediction.excludeTags.length > 0) {
        message += `\n- Các bài tập nên tránh: ${prediction.excludeTags.join(', ')}`;
      }
      
      // Chuyển đổi kết quả dự đoán sang định dạng HealthAnalyzerResponse
      return {
        workout_tags: prediction.recommendTags,
        health_info_tags: [],
        illness_tags: prediction.excludeTags,
        message
      };
    } catch (error) {
      console.error('Error analyzing health info:', error);
      throw error;
    }
  }
} 