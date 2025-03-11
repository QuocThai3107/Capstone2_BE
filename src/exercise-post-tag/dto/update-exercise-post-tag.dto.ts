import { PartialType } from '@nestjs/mapped-types';
import { CreateExercisePostTagDto } from './create-exercise-post-tag.dto';

export class UpdateExercisePostTagDto extends PartialType(CreateExercisePostTagDto) {} 