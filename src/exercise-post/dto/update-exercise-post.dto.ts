import { PartialType } from '@nestjs/mapped-types';
import { CreateExercisePostDto } from './create-exercise-post.dto';

export class UpdateExercisePostDto extends PartialType(CreateExercisePostDto) {} 