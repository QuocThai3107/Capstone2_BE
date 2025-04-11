import { HEALTH_KEYWORDS, HEALTH_INFO_KEYWORDS, ILLNESS_KEYWORDS, TAG_RULES } from './constants';

export class HealthAnalyzer {
  private health_keywords: typeof HEALTH_KEYWORDS;
  private health_info_keywords: typeof HEALTH_INFO_KEYWORDS;
  private illness_keywords: typeof ILLNESS_KEYWORDS;
  private tag_rules: typeof TAG_RULES;

  constructor() {
    this.health_keywords = HEALTH_KEYWORDS;
    this.health_info_keywords = HEALTH_INFO_KEYWORDS;
    this.illness_keywords = ILLNESS_KEYWORDS;
    this.tag_rules = TAG_RULES;
  }

  async analyze_health_info(health_info: string, illness: string): Promise<{
    workout_tags: string[];
    health_info_tags: string[];
    illness_tags: string[];
    message: string;
  }> {
    // Combine health info and illness into one string
    const combined_text = `${health_info} ${illness}`.toLowerCase();
    
    // Find matching tags from health keywords
    const workout_tags = new Set<string>();
    for (const [tag, keywords] of Object.entries(this.health_keywords)) {
      if (Array.isArray(keywords) && keywords.some(keyword => combined_text.includes(keyword.toLowerCase()))) {
        workout_tags.add(tag);
      }
    }

    // Find matching tags from health info keywords
    const health_info_tags = new Set<string>();
    for (const [tag, keywords] of Object.entries(this.health_info_keywords)) {
      if (Array.isArray(keywords) && keywords.some(keyword => combined_text.includes(keyword.toLowerCase()))) {
        health_info_tags.add(tag);
      }
    }

    // Find matching tags from illness keywords
    const illness_tags = new Set<string>();
    for (const [tag, keywords] of Object.entries(this.illness_keywords)) {
      if (Array.isArray(keywords) && keywords.some(keyword => combined_text.includes(keyword.toLowerCase()))) {
        illness_tags.add(tag);
      }
    }

    // Apply tag rules based on detected illnesses
    for (const illness_tag of illness_tags) {
      if (this.tag_rules[illness_tag]) {
        const { exclude, recommend } = this.tag_rules[illness_tag];
        
        // Remove excluded tags
        exclude.forEach(tag => {
          workout_tags.delete(tag);
        });

        // Add recommended tags
        recommend.forEach(tag => {
          workout_tags.add(tag);
        });
      }
    }

    return {
      workout_tags: Array.from(workout_tags),
      health_info_tags: Array.from(health_info_tags),
      illness_tags: Array.from(illness_tags),
      message: health_info || illness ? 'Successfully analyzed health information' : 'No health information provided'
    };
  }
} 