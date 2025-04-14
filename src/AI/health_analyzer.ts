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

  private findMatchingTags(text: string, keywords: { [key: string]: string[] }): string[] {
    const matches: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [tag, words] of Object.entries(keywords)) {
      if (words.some(word => lowerText.includes(word.toLowerCase()))) {
        matches.push(tag);
      }
    }

    return matches;
  }

  private cleanText(text: string): string {
    return text.toLowerCase().trim();
  }

  private getTagsFromRules(tags: string[]): { exclude: string[]; recommend: string[] } {
    const excludeTags: string[] = [];
    const recommendedTags: string[] = [];

    for (const tag of tags) {
      if (this.tag_rules[tag]) {
        excludeTags.push(...this.tag_rules[tag].exclude);
        recommendedTags.push(...this.tag_rules[tag].recommend);
      }
    }

    return { exclude: excludeTags, recommend: recommendedTags };
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

      // Find matching tags for each category
      const workoutTags = this.findMatchingTags(cleanedHealthInfo, HEALTH_KEYWORDS);
      const healthInfoTags = this.findMatchingTags(cleanedHealthInfo, HEALTH_INFO_KEYWORDS);
      const illnessTags = this.findMatchingTags(cleanedIllness, ILLNESS_KEYWORDS);

      // Get tags from rules for health info
      const healthInfoRules = this.getTagsFromRules(healthInfoTags);
      
      // Get tags from rules for illness
      const illnessRules = this.getTagsFromRules(illnessTags);

      // Combine all exclude tags
      const allExcludeTags = [...healthInfoRules.exclude, ...illnessRules.exclude];

      // Combine all recommended tags
      const allRecommendedTags = [...healthInfoRules.recommend, ...illnessRules.recommend];

      return {
        workout_tags: workoutTags,
        health_info_tags: [...healthInfoTags, ...allRecommendedTags],
        illness_tags: allExcludeTags,
        message: "Successfully analyzed health information"
      };
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