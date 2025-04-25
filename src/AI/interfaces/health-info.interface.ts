export interface HealthInfo {
  Age?: string;
  Gender?: string;
  Weight?: string;
  Height?: string;
  Max_BPM?: string;
  Avg_BPM?: string;
  Resting_BPM?: string;
  Session_Duration?: string;
  Calories_Burned?: string;
  Experience_Level?: string;
  Fat_Percentage?: string;
  Water_Intake?: string;
  Workout_Frequency?: string;
  BMI?: string;
  [key: string]: string | undefined;
} 