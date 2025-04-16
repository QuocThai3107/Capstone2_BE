import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { ExercisePostService } from './exercise-post.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateExercisePostDto, UpdateExercisePostDto } from './dto';
import { Public } from '../auth/decorator';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Search exercise posts by tags' })
  @ApiQuery({ name: 'includeTags', required: false, description: 'Tags to include (comma-separated)' })
  @ApiQuery({ name: 'excludeTags', required: false, description: 'Tags to exclude (comma-separated)' })
  async searchByTags(
    @Query('includeTags') includeTags?: string,
    @Query('excludeTags') excludeTags?: string,
  ) {
    try {
      // Validate that at least one type of tags is provided
      if (!includeTags && !excludeTags) {
        throw new BadRequestException('Vui lòng cung cấp ít nhất một tag name để tìm kiếm');
      }

      // Convert comma-separated strings to arrays, handling empty strings
      const includeTagArray = includeTags ? includeTags.split(',').map(tag => tag.trim()) : [];
      const excludeTagArray = excludeTags ? excludeTags.split(',').map(tag => tag.trim()) : [];

      // Call service method with processed tags
      const results = await this.exercisePostService.searchByTags(includeTagArray, excludeTagArray);
      
      return {
        status: 'success',
        data: results
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
} 