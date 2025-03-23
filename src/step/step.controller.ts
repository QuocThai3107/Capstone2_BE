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
    if (createStepDto.exercisepost_id) {
      createStepDto.exercisepost_id = +createStepDto.exercisepost_id;
    }
    return this.stepService.create(createStepDto, file);
  }

  @Post('bulk')
  createMany(@Body() createStepDtos: CreateStepDto[]) {
    createStepDtos = createStepDtos.map(dto => ({
      ...dto,
      exercisepost_id: +dto.exercisepost_id
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
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('exercisePostId') exercisePostId: string,
    @Param('stepNumber') stepNumber: string,
    @Body() updateStepDto: UpdateStepDto,
  ) {
    return this.stepService.update(+exercisePostId, stepNumber, updateStepDto);
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