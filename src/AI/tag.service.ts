import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class TagService {
  private tags: string[];
  private tagsInfo: Record<string, any>;
  private readonly pythonApiUrl = 'http://localhost:5000';

  constructor() {
    this.loadTags();
  }

  private loadTags() {
    try {
      const tagsPath = path.join(process.cwd(), 'tag_model', 'tags.json');
      const tagsInfoPath = path.join(process.cwd(), 'tag_model', 'tags_info.json');
      
      this.tags = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
      this.tagsInfo = JSON.parse(fs.readFileSync(tagsInfoPath, 'utf8'));
    } catch (error) {
      console.error('Error loading tags:', error);
      this.tags = ['cardio', 'strength', 'flexibility', 'balance', 'endurance'];
      this.tagsInfo = {
        cardio: 'Cardiovascular exercises',
        strength: 'Strength training exercises',
        flexibility: 'Flexibility exercises',
        balance: 'Balance exercises',
        endurance: 'Endurance exercises'
      };
    }
  }

  async predictTags(text: string) {
    try {
      // Gọi API Python để dự đoán tags
      const response = await axios.post(`${this.pythonApiUrl}/predict`, {
        text: text
      });

      if (response.data.status === 'success') {
        return {
          recommendTags: response.data.data.recommended_tags || [],
          excludeTags: response.data.data.exclude_tags || []
        };
      } else {
        // Fallback nếu API không hoạt động
        return {
          recommendTags: this.tags.slice(0, 3),
          excludeTags: this.tags.slice(3, 5)
        };
      }
    } catch (error) {
      console.error('Error predicting tags:', error);
      // Fallback nếu có lỗi
      return {
        recommendTags: this.tags.slice(0, 3),
        excludeTags: this.tags.slice(3, 5)
      };
    }
  }

  async predictTagsFromHealthInfo(healthInfo: string, illness: string) {
    try {
      // Gọi API Python để dự đoán tags từ thông tin sức khỏe
      const response = await axios.post(`${this.pythonApiUrl}/predict-from-health`, {
        healthInfo: healthInfo,
        illness: illness
      });

      if (response.data.status === 'success') {
        return {
          recommendTags: response.data.data.recommended_tags || [],
          excludeTags: response.data.data.exclude_tags || []
        };
      } else {
        // Fallback nếu API không hoạt động
        return this.fallbackPredictTagsFromHealthInfo(healthInfo, illness);
      }
    } catch (error) {
      console.error('Error predicting tags from health info:', error);
      // Fallback nếu có lỗi
      return this.fallbackPredictTagsFromHealthInfo(healthInfo, illness);
    }
  }

  // Phương thức fallback khi API không hoạt động
  private fallbackPredictTagsFromHealthInfo(healthInfo: string, illness: string) {
    // Parse health info để lấy Experience_Level
    const experienceLevel = healthInfo.split(',').find(info => info.includes('Experience_Level'))?.split(':')[1];
    
    // Đảm bảo luôn có ít nhất 1 tag về độ khó
    const difficultyTags = ['Beginner', 'Intermediate', 'Expert'];
    let recommendTags = [];
    
    // Thêm tag độ khó dựa vào Experience_Level
    if (experienceLevel) {
      recommendTags.push(experienceLevel);
    } else {
      // Nếu không có Experience_Level, mặc định là Beginner
      recommendTags.push('Beginner');
    }
    
    // Thêm các tag khác dựa vào illness
    if (illness === 'none') {
      recommendTags = [...recommendTags, 'Cardio', 'Strength Training'];
    } else {
      recommendTags = [...recommendTags, 'Mobility', 'Relaxation'];
    }
    
    const excludeTags = illness === 'none'
      ? ['Relaxation']
      : ['Strength Training'];

    return {
      recommendTags,
      excludeTags
    };
  }

  getTagsInfo() {
    return {
      tags: this.tags,
      tagsInfo: this.tagsInfo
    };
  }
} 