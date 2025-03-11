import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StepService } from './step.service';
import { CreateStepDto, UpdateStepDto } from './dto';

@Controller('steps')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  create(@Body() createStepDto: CreateStepDto) {
    return this.stepService.create(createStepDto);
  }

  @Post('bulk')
  createMany(@Body() createStepDtos: CreateStepDto[]) {
    return this.stepService.createMany(createStepDtos);
  }

  @Get()
  findAll() {
    return this.stepService.findAll();
  }

  @Get('exercise/:exercisePostId')
  findByExercisePost(@Param('exercisePostId') exercisePostId: string) {
    return this.stepService.findByExercisePost(+exercisePostId);
  }

  @Get(':exercisePostId/:stepNumber')
  findOne(
    @Param('exercisePostId') exercisePostId: string,
    @Param('stepNumber') stepNumber: string
  ) {
    return this.stepService.findOne(+exercisePostId, stepNumber);
  }

  @Patch(':exercisePostId/:stepNumber')
  update(
    @Param('exercisePostId') exercisePostId: string,
    @Param('stepNumber') stepNumber: string,
    @Body() updateStepDto: UpdateStepDto
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
    return this.stepService.removeAllSteps(+exercisePostId);
  }
} 