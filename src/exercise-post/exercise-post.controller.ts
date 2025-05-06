import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { ExercisePostService } from './exercise-post.service';
import { CreateExercisePostDto } from './dto/create-exercise-post.dto';
import { UpdateExercisePostDto } from './dto/update-exercise-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../auth/decorator';
import { Public } from '../auth/decorator/public.decorator';
import { MulterFile } from '../interfaces/file.interface';

@Controller('exercise-post')
export class ExercisePostController {
  constructor(private readonly exercisePostService: ExercisePostService) {}
  
  @Public()
  @Get()
  findAll() {
    return this.exercisePostService.findAll();
  }

  @Public()
  @Get('search/bytags')
  async searchByTags(
    @Query('includeTags') includeTags: string,
    @Query('excludeTags') excludeTags: string
  ) {
    const includeTagsArray = includeTags ? includeTags.split(',') : [];
    const excludeTagsArray = excludeTags ? excludeTags.split(',') : [];
    
    return this.exercisePostService.searchByTagsAdvanced(includeTagsArray, excludeTagsArray);
  }

  @Public()
  @Get('tag/tag')
  getAllTags() {
    return this.exercisePostService.getAllTags();
  }
  
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisePostService.findOne(+id);
  } 
  
  @Public()
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateExercisePostDto: any,  // Change to any to avoid TypeScript error
    @UploadedFile() file: MulterFile
  ) {
    console.log('Update file received:', file?.originalname, file?.size);
    console.log('Update DTO received:', JSON.stringify(updateExercisePostDto, null, 2));
    
    // Gán status_id = 1 mỗi khi update exercise
    updateExercisePostDto.status_id = 1;
    console.log('Forcing status_id to 1 for update');
    
    return this.exercisePostService.update(+id, updateExercisePostDto, file);
  }
  
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status_id: number }
  ) {
    return this.exercisePostService.updateStatus(+id, updateStatusDto.status_id);
  }
  
  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createExercisePostDto: any,  // Change to any temporarily
    @UploadedFile() file: MulterFile,
    @GetUser('user_id') userId: number
  ) {
    console.log('Create file received:', file?.originalname, file?.size);
    console.log('Create DTO received:', JSON.stringify(createExercisePostDto, null, 2));
    console.log('User ID from decorator:', userId);
    
    // Try to process the data properly
    try {
      // Create a properly formatted DTO
      const formattedDto: CreateExercisePostDto = {
        name: createExercisePostDto.name || '',
        description: createExercisePostDto.description || '',
        video_rul: createExercisePostDto.video_rul
      };
      
      // Handle tagIds
      if (createExercisePostDto.tagIds) {
        if (Array.isArray(createExercisePostDto.tagIds)) {
          formattedDto.tagIds = createExercisePostDto.tagIds.map(id => +id);
        } else if (typeof createExercisePostDto.tagIds === 'string') {
          // Handle possible JSON string
          try {
            formattedDto.tagIds = JSON.parse(createExercisePostDto.tagIds).map(id => +id);
          } catch {
            formattedDto.tagIds = [+createExercisePostDto.tagIds];
          }
        } else if (typeof createExercisePostDto.tagIds === 'object') {
          // Handle form-data structure like tagIds[0]=1
          const tagIds = [];
          Object.keys(createExercisePostDto.tagIds).forEach(key => {
            tagIds.push(+createExercisePostDto.tagIds[key]);
          });
          formattedDto.tagIds = tagIds;
        }
      }
      
      // Handle steps
      if (createExercisePostDto.steps) {
        if (Array.isArray(createExercisePostDto.steps)) {
          formattedDto.steps = createExercisePostDto.steps;
        } else if (typeof createExercisePostDto.steps === 'string') {
          // Handle possible JSON string
          try {
            formattedDto.steps = JSON.parse(createExercisePostDto.steps);
          } catch {
            formattedDto.steps = [];
          }
        } else if (typeof createExercisePostDto.steps === 'object') {
          // Handle form-data structure with steps[0][instruction]=xyz
          const stepsObj = createExercisePostDto.steps;
          const stepNumbers = new Set();
          
          // Extract step indices
          Object.keys(stepsObj).forEach(key => {
            const matches = key.match(/\[(\d+)\]/);
            if (matches && matches[1]) {
              stepNumbers.add(matches[1]);
            }
          });
          
          const stepsArray = [];
          stepNumbers.forEach(index => {
            const stepKey = `[${index}]`;
            const instructionKey = Object.keys(stepsObj).find(k => 
              k.includes(stepKey) && k.includes('instruction')
            );
            
            const imgUrlKey = Object.keys(stepsObj).find(k => 
              k.includes(stepKey) && k.includes('img_url')
            );
            
            if (instructionKey) {
              stepsArray.push({
                instruction: stepsObj[instructionKey],
                img_url: imgUrlKey ? stepsObj[imgUrlKey] : ''
              });
            }
          });
          
          formattedDto.steps = stepsArray;
        }
      }
      
      // Lấy user_id từ form data nếu có, không đặt mặc định là 1
      const userIdToUse = createExercisePostDto.user_id ? +createExercisePostDto.user_id : userId;
      console.log('Using user_id:', userIdToUse);
      
      console.log('Processed DTO:', JSON.stringify(formattedDto, null, 2));
      
      return this.exercisePostService.create(formattedDto, file, userIdToUse);
    } catch (error) {
      console.error('Error processing create request:', error);
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exercisePostService.remove(+id);
  }
} 