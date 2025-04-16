import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ExercisePostService } from './exercise-post.service';
import { CreateExercisePostDto } from './dto/create-exercise-post.dto';
import { UpdateExercisePostDto } from './dto/update-exercise-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorator';

@Controller('exercise-post')
export class ExercisePostController {
  constructor(private readonly exercisePostService: ExercisePostService) {}
  
  @Get()
  findAll() {
    return this.exercisePostService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisePostService.findOne(+id);
  } 
  @Get('tag/tag')
  getAllTags() {
    return this.exercisePostService.getAllTags();
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imgUrl'))
  update(
    @Param('id') id: string,
    @Body() updateExercisePostDto: UpdateExercisePostDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.exercisePostService.update(+id, updateExercisePostDto, file);
  }
  @Patch(':id/status')
@UseGuards(JwtAuthGuard)
updateStatus(
  @Param('id') id: string,
  @Body() updateStatusDto: { status_id: number }
) {
  return this.exercisePostService.updateStatus(+id, updateStatusDto.status_id);
}
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imgUrl'))
  create(
    @Body() createExercisePostDto: CreateExercisePostDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('user_id') userId: number
  ) {
    return this.exercisePostService.create(createExercisePostDto, file, userId);
  }



  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.exercisePostService.remove(+id);
  }


} 