import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExercisePostTagService } from './exercise-post-tag.service';
import { CreateExercisePostTagDto, UpdateExercisePostTagDto } from './dto';
import { CreateTagDto } from './dto/create-tag.dto';

@Controller('exercise-post-tag')
export class ExercisePostTagController {
  constructor(private readonly exercisePostTagService: ExercisePostTagService) {}

  // Tag management endpoints
  @Post('tag')
  createTag(@Body() createTagDto: CreateTagDto) {
    return this.exercisePostTagService.createTag(createTagDto);
  }

  @Get('tag')
  findAllTags() {
    return this.exercisePostTagService.findAllTags();
  }

  @Delete('tag/:id')
  removeTag(@Param('id') id: string) {
    return this.exercisePostTagService.removeTag(+id);
  }

  // Exercise Post Tag endpoints
  @Post()
  create(@Body() createExercisePostTagDto: CreateExercisePostTagDto) {
    return this.exercisePostTagService.create(createExercisePostTagDto);
  }

  @Post('many')
  createMany(@Body() createExercisePostTagDtos: CreateExercisePostTagDto[]) {
    return this.exercisePostTagService.createMany(createExercisePostTagDtos);
  }

  @Get()
  findAll() {
    return this.exercisePostTagService.findAll();
  }

  @Get('exercise-post/:exercisePostId')
  findByExercisePostId(@Param('exercisePostId') exercisePostId: string) {
    return this.exercisePostTagService.findByExercisePostId(+exercisePostId);
  }

  @Get('tag/:tagId')
  findByTagId(@Param('tagId') tagId: string) {
    return this.exercisePostTagService.findByTagId(+tagId);
  }

  @Get(':exercisePostId/:tagId')
  findOne(
    @Param('exercisePostId') exercisePostId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.exercisePostTagService.findOne(+exercisePostId, +tagId);
  }

  @Patch(':exercisePostId/:tagId')
  update(
    @Param('exercisePostId') exercisePostId: string,
    @Param('tagId') tagId: string,
    @Body() updateExercisePostTagDto: UpdateExercisePostTagDto,
  ) {
    return this.exercisePostTagService.update(+exercisePostId, +tagId, updateExercisePostTagDto);
  }

  @Delete(':exercisePostId/:tagId')
  remove(
    @Param('exercisePostId') exercisePostId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.exercisePostTagService.remove(+exercisePostId, +tagId);
  }

  @Delete('exercise-post/:exercisePostId')
  removeByExercisePostId(@Param('exercisePostId') exercisePostId: string) {
    return this.exercisePostTagService.removeByExercisePostId(+exercisePostId);
  }
} 