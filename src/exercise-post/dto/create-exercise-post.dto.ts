export class CreateExercisePostDto {
  name: string;
  description: string;
  imgUrl?: string;
  steps?: CreateStepDto[];
  tagIds?: number[];
}

export class CreateStepDto {
  stepNumber: string;
  instruction: string;
  imgUrl?: string;
} 