import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ExercisePostService } from './exercise-post.service';
import { CreateExercisePostDto, UpdateExercisePostDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('exercise-posts')
export class ExercisePostController {
  constructor(private readonly exercisePostService: ExercisePostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createExercisePostDto: CreateExercisePostDto,
  ) {
    return this.exercisePostService.create(createExercisePostDto);
  }

  @Get()
  findAll() {
    return this.exercisePostService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisePostService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateExercisePostDto: UpdateExercisePostDto,
  ) {
    return this.exercisePostService.update(+id, updateExercisePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exercisePostService.remove(+id);
  }
} 