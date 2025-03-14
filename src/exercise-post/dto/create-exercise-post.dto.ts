export class CreateExercisePostDto {
  name: string;
  description: string;
  imgUrl?: string;
  steps?: CreateStepDto[] | string;
  tagIds?: number[] | string;
}

export class CreateStepDto {
  stepNumber: string;
  instruction: string;
  imgUrl?: string;
} 