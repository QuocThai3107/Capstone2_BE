export const HEALTH_KEYWORDS: { [key: string]: string[] } = {
  // Level tags
  "Easy": ["beginner", "easy", "basic", "simple", "starter", "new", "novice"],
  "Intermediate": ["intermediate", "medium", "moderate", "average"],
  "Hard": ["hard", "advanced", "difficult", "challenging", "expert"],

  // Workout Type tags
  "Strength": ["strength", "muscle", "power", "weight", "lifting", "build muscle", "muscle gain"],
  "Endurance": ["endurance", "stamina", "cardio", "aerobic", "running", "cycling"],
  "Therapeutic": ["therapeutic", "rehabilitation", "recovery", "healing", "therapy"],
  "Recovery": ["recovery", "rest", "healing", "injury", "pain", "rehabilitation"],
  "HIIT": ["hiit", "high intensity", "interval", "circuit", "tabata"],

  // Style tags
  "Yoga": ["yoga", "flexibility", "stretching", "meditation", "mindfulness"],
  "Pilates": ["pilates", "core", "posture", "balance", "control"],
  "Aerobic": ["aerobic", "cardio", "dance", "rhythm", "movement"],
  "Powerlifting": ["powerlifting", "strength", "power", "compound", "heavy"],
  "CrossFit": ["crossfit", "functional", "varied", "intense", "workout"],
  "Zumba": ["zumba", "dance", "rhythm", "cardio", "fun"],

  // Muscle Group tags
  "Chest": ["chest", "pectoral", "push", "bench"],
  "Lats": ["lats", "back", "pull", "latissimus"],
  "Shoulders": ["shoulder", "deltoid", "press", "overhead"],
  "Legs": ["leg", "thigh", "quad", "hamstring", "calf"],
  "Abs": ["abs", "core", "abdominal", "six pack"],
  "Biceps": ["bicep", "arm", "curl", "forearm"],
  "Triceps": ["tricep", "arm", "extension"],
  "Lower Back": ["lower back", "spine", "posture"],
  "Glutes": ["glute", "butt", "hip", "posterior"],
  "Full Body": ["full body", "total body", "whole body", "compound"]
};

export const HEALTH_INFO_KEYWORDS: { [key: string]: string[] } = {
  "Weight Loss": ["weight loss", "fat loss", "slim", "reduce weight", "diet"],
  "Muscle Gain": ["muscle gain", "build muscle", "strength", "bulk"],
  "Fitness": ["fitness", "shape", "tone", "condition"],
  "Overall Health": ["health", "wellness", "general health", "lifestyle"],
  "Competition": ["competition", "sport", "athlete", "performance"],
  
  // Current Status
  "Height": ["height", "cm", "tall"],
  "Weight": ["weight", "kg", "mass"],
  "Body Fat": ["body fat", "fat percentage", "body composition"],
  "Training Frequency": ["training frequency", "sessions per week", "workout frequency"],
  "Training Duration": ["training duration", "session length", "workout time"],
  
  // Diet
  "Normal Diet": ["normal diet", "regular diet", "balanced diet"],
  "Vegetarian": ["vegetarian", "vegan", "plant-based"],
  "Special Diet": ["low carb", "keto", "eat clean", "diet plan"],
  "Food Allergy": ["allergy", "food allergy", "intolerance", "avoid"]
};

export const ILLNESS_KEYWORDS: { [key: string]: string[] } = {
  "Hypertension": ["high blood pressure", "hypertension", "bp", "blood pressure"],
  "Cardiovascular": ["heart disease", "cardiovascular", "cardiac", "heart condition"],
  "Diabetes": ["diabetes", "blood sugar", "insulin", "diabetic"],
  "Herniated Disc": ["herniated disc", "back pain", "spine", "disc", "sciatica"],
  "Joint Injury": ["joint pain", "knee injury", "shoulder injury", "wrist injury", "arthritis"],
  "Respiratory": ["asthma", "breathing problem", "respiratory", "lung condition", "copd"],
  "Obesity": ["obesity", "overweight", "high bmi", "excess weight"],
  "Chronic Pain": ["chronic pain", "persistent pain", "long term pain"],
  "Anxiety": ["anxiety", "stress", "panic", "mental health"],
  "Depression": ["depression", "mood", "mental health", "emotional"],
  
  // Muscle Pain and Issues
  "Chest Pain": ["chest pain", "pectoral pain", "chest muscle pain", "chest strain"],
  "Back Pain": ["back pain", "lower back pain", "upper back pain", "spine pain"],
  "Shoulder Pain": ["shoulder pain", "rotator cuff", "shoulder injury", "shoulder strain"],
  "Knee Pain": ["knee pain", "knee injury", "knee strain", "patellar"],
  "Hip Pain": ["hip pain", "hip injury", "hip strain", "glute pain"],
  "Elbow Pain": ["elbow pain", "tennis elbow", "golfer's elbow", "elbow strain"],
  "Wrist Pain": ["wrist pain", "carpal tunnel", "wrist strain", "wrist injury"],
  "Ankle Pain": ["ankle pain", "ankle injury", "ankle strain", "sprain"],
  "Neck Pain": ["neck pain", "cervical pain", "neck strain", "whiplash"],
  "Muscle Weakness": ["muscle weakness", "weak muscles", "muscle fatigue", "lack of strength"]
};

export const TAG_RULES: { [key: string]: { exclude: string[]; recommend: string[] } } = {
  'Respiratory': {
    'exclude': ['cardio', 'hiit', 'running', 'endurance'],
    'recommend': ['yoga', 'walking', 'light exercise', 'breathing exercises']
  },
  'Cardiovascular': {
    'exclude': ['heavy lifting', 'powerlifting', 'hiit', 'intense cardio'],
    'recommend': ['walking', 'yoga', 'light swimming', 'low impact cardio']
  },
  'Joint Injury': {
    'exclude': ['running', 'jumping', 'heavy squats', 'high impact'],
    'recommend': ['yoga', 'swimming', 'light exercise', 'physical therapy']
  },
  'Diabetes': {
    'exclude': ['overtraining', 'high intensity', 'extreme exercise'],
    'recommend': ['light cardio', 'walking', 'yoga', 'moderate exercise']
  },
  'Obesity': {
    'exclude': ['heavy lifting', 'high impact', 'intense cardio'],
    'recommend': ['walking', 'swimming', 'light cardio', 'low impact exercise']
  },
  'Hypertension': {
    'exclude': ['heavy lifting', 'high intensity', 'powerlifting'],
    'recommend': ['walking', 'yoga', 'light cardio', 'meditation']
  },
  'Herniated Disc': {
    'exclude': ['heavy lifting', 'high impact', 'twisting movements'],
    'recommend': ['physical therapy', 'core strengthening', 'gentle stretching']
  },
  // Rules for muscle pain and issues
  'Chest Pain': {
    'exclude': ['chest', 'bench press', 'push-ups', 'dips'],
    'recommend': ['rest', 'ice', 'gentle stretching', 'physical therapy']
  },
  'Back Pain': {
    'exclude': ['deadlift', 'squats', 'heavy lifting', 'twisting'],
    'recommend': ['core strengthening', 'gentle stretching', 'yoga', 'swimming']
  },
  'Shoulder Pain': {
    'exclude': ['overhead press', 'bench press', 'pull-ups', 'dips'],
    'recommend': ['rotator cuff exercises', 'gentle stretching', 'physical therapy']
  },
  'Knee Pain': {
    'exclude': ['squats', 'lunges', 'running', 'jumping'],
    'recommend': ['leg extensions', 'gentle stretching', 'swimming', 'cycling']
  },
  'Hip Pain': {
    'exclude': ['squats', 'deadlifts', 'lunges', 'hip thrusts'],
    'recommend': ['gentle stretching', 'hip mobility', 'swimming', 'yoga']
  },
  'Elbow Pain': {
    'exclude': ['bicep curls', 'tricep extensions', 'push-ups', 'dips'],
    'recommend': ['rest', 'ice', 'gentle stretching', 'physical therapy']
  },
  'Wrist Pain': {
    'exclude': ['push-ups', 'bench press', 'dips', 'handstands'],
    'recommend': ['wrist mobility', 'gentle stretching', 'rest', 'physical therapy']
  },
  'Ankle Pain': {
    'exclude': ['running', 'jumping', 'plyometrics', 'high impact'],
    'recommend': ['ankle mobility', 'gentle stretching', 'swimming', 'cycling']
  },
  'Neck Pain': {
    'exclude': ['overhead press', 'shrugs', 'deadlifts', 'heavy lifting'],
    'recommend': ['neck mobility', 'gentle stretching', 'posture exercises', 'yoga']
  },
  'Muscle Weakness': {
    'exclude': ['heavy lifting', 'high intensity', 'complex movements'],
    'recommend': ['light weights', 'bodyweight exercises', 'progressive overload', 'proper form']
  }
}; 