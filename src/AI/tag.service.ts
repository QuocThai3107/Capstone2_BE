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
      const tagsPath = path.join(process.cwd(), 'tag_model', 'tags_info.json');
      const tagsInfoPath = path.join(process.cwd(), 'tag_model', 'tags_info.json');
      
      const tagsData = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
      this.tags = tagsData.valid_tags || [];
      this.tagsInfo = tagsData;
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

      if (response.data && response.data.recommended_tags) {
        return {
          recommendTags: response.data.recommended_tags,
          excludeTags: response.data.exclude_tags || []
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
      console.log('Calling Python API with healthInfo:', healthInfo, 'illness:', illness);
      
      // Gọi API Python để dự đoán tags từ thông tin sức khỏe
      const response = await axios.post(`${this.pythonApiUrl}/predict-from-health`, {
        healthInfo: healthInfo,
        illness: illness
      });

      console.log('Response from Python API:', JSON.stringify(response.data, null, 2));

      // Kiểm tra response từ Python API với định dạng mới
      if (response.data && response.data.status === 'success' && response.data.data) {
        // Truy cập đúng các trường trong data
        const recommendTags = response.data.data.recommendTags || [];
        const excludeTags = response.data.data.excludeTags || [];
        
        console.log('Extracted tags:', { recommendTags, excludeTags });
        
        return {
          recommendTags,
          excludeTags
        };
      } else {
        console.log('API response format not as expected, using fallback');
        // Fallback nếu API không hoạt động đúng format
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
    let recommendTags = [];
    let excludeTags = [];
    
    // Xử lý illness trước
    if (illness && illness !== 'none') {
      const illnesses = illness.split(',').map(i => i.trim());
      
      // Xác định các tag nên tránh dựa vào illness
      for (const ill of illnesses) {
        if (ill === 'knee_pain' || ill === 'leg_pain') {
          excludeTags = [...excludeTags, 'HIIT', 'Jumping', 'Squats', 'Running', 'Plyometrics'];
          recommendTags = [...recommendTags, 'Mobility', 'Stretching', 'Low Impact'];
        } else if (ill === 'back_pain') {
          excludeTags = [...excludeTags, 'Deadlifts', 'Heavy Lifting', 'Twisting'];
          recommendTags = [...recommendTags, 'Core', 'Stability', 'Posture'];
        } else if (ill === 'shoulder_injury') {
          excludeTags = [...excludeTags, 'Overhead Press', 'Pull-ups', 'Push-ups'];
          recommendTags = [...recommendTags, 'Mobility', 'Range of Motion'];
        } else if (ill === 'wrist_injury') {
          excludeTags = [...excludeTags, 'Push-ups', 'Planks', 'Handstands'];
          recommendTags = [...recommendTags, 'Mobility', 'Flexibility'];
        } else if (ill === 'ankle_sprain') {
          excludeTags = [...excludeTags, 'Running', 'Jumping', 'Plyometrics'];
          recommendTags = [...recommendTags, 'Balance', 'Stability'];
        } else if (ill === 'asthma') {
          excludeTags = [...excludeTags, 'HIIT', 'Long Distance Running', 'High Intensity'];
          recommendTags = [...recommendTags, 'Breathing', 'Low Intensity'];
        } else if (ill === 'chest_pain') {
          excludeTags = [...excludeTags, 'High Intensity', 'Heavy Lifting', 'HIIT'];
          recommendTags = [...recommendTags, 'Breathing', 'Light Cardio'];
        }
      }
    }
    
    // Nếu không có illness hoặc không có tag nào được thêm vào
    if (recommendTags.length === 0) {
      recommendTags = ['Cardio', 'Strength Training', 'Flexibility'];
    }
    
    // Loại bỏ các tag trùng lặp
    recommendTags = [...new Set(recommendTags)];
    excludeTags = [...new Set(excludeTags)];
    
    console.log('Using fallback method, returning:', { recommendTags, excludeTags });
    
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