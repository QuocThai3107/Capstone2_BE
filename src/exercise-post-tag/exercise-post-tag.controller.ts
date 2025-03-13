import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ExercisePostTagService } from './exercise-post-tag.service';
import { CreateExercisePostTagDto } from './dto';
import { CreateTagDto } from './dto/create-tag.dto';

@Controller('exercise-post-tags')
export class ExercisePostTagController {
  constructor(private readonly exercisePostTagService: ExercisePostTagService) {}

  // Tag management endpoints
  @Post('tag')
  createTag(@Body() createTagDto: CreateTagDto) {
    return this.exercisePostTagService.createTag(createTagDto);
  }

  @Get('tags')
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

  @Post('bulk')
  createMany(@Body() createExercisePostTagDtos: CreateExercisePostTagDto[]) {
    return this.exercisePostTagService.createMany(createExercisePostTagDtos);
  }

  @Get()
  findAll() {
    return this.exercisePostTagService.findAll();
  }

  @Get('exercise/:exercisePostId')
  findByExercisePost(@Param('exercisePostId') exercisePostId: string) {
    return this.exercisePostTagService.findByExercisePost(+exercisePostId);
  }

  @Get('tag/:tagId')
  findByTag(@Param('tagId') tagId: string) {
    return this.exercisePostTagService.findByTag(+tagId);
  }

  @Get(':exercisePostId/:tagId')
  findOne(
    @Param('exercisePostId') exercisePostId: string,
    @Param('tagId') tagId: string
  ) {
    return this.exercisePostTagService.findOne(+exercisePostId, +tagId);
  }

  @Delete(':exercisePostId/:tagId')
  remove(
    @Param('exercisePostId') exercisePostId: string,
    @Param('tagId') tagId: string
  ) {
    return this.exercisePostTagService.remove(+exercisePostId, +tagId);
  }

  @Delete('exercise/:exercisePostId')
  removeAllTags(@Param('exercisePostId') exercisePostId: string) {
    return this.exercisePostTagService.removeAllTags(+exercisePostId);
  }
} 