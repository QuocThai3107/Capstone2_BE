import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { StepService } from './step.service';
import { CreateStepDto, UpdateStepDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('steps')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createStepDto: CreateStepDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (createStepDto.exercisePostId) {
      createStepDto.exercisePostId = +createStepDto.exercisePostId;
    }
    return this.stepService.create(createStepDto, file);
  }

  @Post('bulk')
  createMany(@Body() createStepDtos: CreateStepDto[]) {
    createStepDtos = createStepDtos.map(dto => ({
      ...dto,
      exercisePostId: +dto.exercisePostId
    }));
    return this.stepService.createMany(createStepDtos);
  }

  @Get()
  findAll() {
    return this.stepService.findAll();
  }

  @Get('exercise/:exercisePostId')
  findByExercisePost(@Param('exercisePostId') exercisePostId: string) {
    return this.stepService.findByExercisePostId(+exercisePostId);
  }

  @Get(':exercisePostId/:stepNumber')
  findOne(
    @Param('exercisePostId') exercisePostId: string,
    @Param('stepNumber') stepNumber: string
  ) {
    return this.stepService.findOne(+exercisePostId, stepNumber);
  }

  @Patch(':exercisePostId/:stepNumber')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('exercisePostId') exercisePostId: string,
    @Param('stepNumber') stepNumber: string,
    @Body() updateStepDto: UpdateStepDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.stepService.update(+exercisePostId, stepNumber, updateStepDto, file);
  }

  @Delete(':exercisePostId/:stepNumber')
  remove(
    @Param('exercisePostId') exercisePostId: string,
    @Param('stepNumber') stepNumber: string
  ) {
    return this.stepService.remove(+exercisePostId, stepNumber);
  }

  @Delete('exercise/:exercisePostId')
  removeAllSteps(@Param('exercisePostId') exercisePostId: string) {
    return this.stepService.removeByExercisePostId(+exercisePostId);
  }
} 