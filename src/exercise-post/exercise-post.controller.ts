import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ExercisePostService } from './exercise-post.service';
import { CreateExercisePostDto, UpdateExercisePostDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('exercise-posts')
export class ExercisePostController {
  constructor(private readonly exercisePostService: ExercisePostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createExercisePostDto: CreateExercisePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.exercisePostService.create(createExercisePostDto, file);
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
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateExercisePostDto: UpdateExercisePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.exercisePostService.update(+id, updateExercisePostDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exercisePostService.remove(+id);
  }
} 