import { spawn } from 'child_process';
import { HEALTH_KEYWORDS, HEALTH_INFO_KEYWORDS, ILLNESS_KEYWORDS, TAG_RULES } from './constants';

export class HealthAnalyzer {
  private health_keywords: typeof HEALTH_KEYWORDS;
  private health_info_keywords: typeof HEALTH_INFO_KEYWORDS;
  private illness_keywords: typeof ILLNESS_KEYWORDS;
  private tag_rules: typeof TAG_RULES;
  private modelPath: string;

  constructor(modelPath: string = './tag_model') {
    this.health_keywords = HEALTH_KEYWORDS;
    this.health_info_keywords = HEALTH_INFO_KEYWORDS;
    this.illness_keywords = ILLNESS_KEYWORDS;
    this.tag_rules = TAG_RULES;
    this.modelPath = modelPath;
  }

  private cleanText(text: string): string {
    return text.toLowerCase().trim();
  }

  public async analyze_health_info(health_info: string, illness: string): Promise<{
    workout_tags: string[];
    health_info_tags: string[];
    illness_tags: string[];
    message: string;
  }> {
    try {
      // Clean input texts
      const cleanedHealthInfo = this.cleanText(health_info);
      const cleanedIllness = this.cleanText(illness);

      // Kết hợp health_info và illness thành một text
      const combinedText = `${cleanedHealthInfo} ${cleanedIllness}`;

      // Gọi Python script để dự đoán tags
      const pythonProcess = spawn('python', [
        'tag_trainer.py',
        '--predict',
        '--text', combinedText,
        '--model_path', this.modelPath
      ]);

      let predictedTags = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        predictedTags += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      return new Promise((resolve, reject) => {
        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Python process exited with code ${code}: ${error}`));
            return;
          }

          try {
            const tags = JSON.parse(predictedTags);
            
            // Phân loại tags thành các nhóm
            const workoutTags = tags.filter(tag => 
              Object.keys(HEALTH_KEYWORDS).includes(tag)
            );
            
            const healthInfoTags = tags.filter(tag => 
              Object.keys(HEALTH_INFO_KEYWORDS).includes(tag)
            );
            
            const illnessTags = tags.filter(tag => 
              Object.keys(ILLNESS_KEYWORDS).includes(tag)
            );

            resolve({
              workout_tags: workoutTags,
              health_info_tags: healthInfoTags,
              illness_tags: illnessTags,
              message: "Successfully analyzed health information"
            });
          } catch (e) {
            reject(new Error(`Failed to parse Python output: ${e.message}`));
          }
        });
      });
    } catch (error) {
      console.error('Error in analyze_health_info:', error);
      return {
        workout_tags: [],
        health_info_tags: [],
        illness_tags: [],
        message: "Error analyzing health information"
      };
    }
  }
} 