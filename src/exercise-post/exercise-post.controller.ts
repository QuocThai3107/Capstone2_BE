import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Query } from '@nestjs/common';
import { ExercisePostService } from './exercise-post.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateExercisePostDto, UpdateExercisePostDto } from './dto';
import { Public } from '../auth/decorator';

@Controller('exercise-post')
export class ExercisePostController {
  constructor(private readonly exercisePostService: ExercisePostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imgUrl'))
  async create(
    @Body() createExercisePostDto: CreateExercisePostDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    ) 
    file?: Express.Multer.File
  ) {
    // Log để debug
    console.log('DTO received:', createExercisePostDto);
    console.log('File received:', file);
    
    // Parse các trường có thể là string nhưng cần là số
    if (createExercisePostDto.user_id && typeof createExercisePostDto.user_id === 'string') {
      createExercisePostDto.user_id = parseInt(createExercisePostDto.user_id);
    }
    
    if (createExercisePostDto.tagIds && typeof createExercisePostDto.tagIds === 'string') {
      createExercisePostDto.tagIds = [parseInt(createExercisePostDto.tagIds)];
    }
    
    // Parse steps nếu được gửi dưới dạng string
    if (createExercisePostDto.steps && typeof createExercisePostDto.steps === 'string') {
      try {
        createExercisePostDto.steps = JSON.parse(createExercisePostDto.steps);
      } catch (e) {
        console.error('Failed to parse steps:', e);
      }
    }
    
    return this.exercisePostService.create(createExercisePostDto, file);
  }

  @Public()
  @Get()
  findAll() {
    return this.exercisePostService.findAll();
  }

  @Public()
  @Get('search')
  async searchExercises(
    @Query('tags') tags?: string,
    @Query('name') name?: string,
    @Query('description') description?: string,
  ) {
    const searchParams = {
      tags: tags ? tags.split(',') : [],
      name,
      description
    };
    return this.exercisePostService.search(searchParams);
  }

  @Public()
  @Get('bytags')
  async getExercisesByTags(@Query('tags') tags: string) {
    const tagIds = tags.split(',').map(id => parseInt(id));
    return this.exercisePostService.findByTags(tagIds);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisePostService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('imgUrl'))
  update(
    @Param('id') id: string,
    @Body() updateExercisePostDto: UpdateExercisePostDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.exercisePostService.update(+id, updateExercisePostDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exercisePostService.remove(+id);
  }

  @Public()
  @Get('tags')
  getAllTags() {
    return this.exercisePostService.getAllTags();
  }

  @Public()
  @Get('search/bytags')
  async searchByTagNames(@Query('tagNames') tagNames: string) {
    if (!tagNames) {
      return {
        status: 'error',
        message: 'Vui lòng cung cấp ít nhất một tag name'
      };
    }
    const tagNameArray = tagNames.split(',').map(tag => tag.trim());
    return this.exercisePostService.searchByTagNames(tagNameArray);
  }
} 