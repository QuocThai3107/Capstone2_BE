import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ExercisePostService } from './exercise-post.service';
import { CreateExercisePostDto, UpdateExercisePostDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorator';

@Controller('exercise-post')
@UseGuards(JwtAuthGuard)
export class ExercisePostController {
  constructor(private readonly exercisePostService: ExercisePostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @GetUser('user_id') userId: number,
    @Body() createExercisePostDto: CreateExercisePostDto,
  ) {
    createExercisePostDto.user_id = userId;
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