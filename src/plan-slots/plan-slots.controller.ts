import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PlanSlotsService } from './plan-slots.service';
import { CreatePlanSlotDto } from './dto/create-plan-slot.dto';

@Controller('plan-slots')
export class PlanSlotsController {
  constructor(private readonly planSlotsService: PlanSlotsService) {}

  @Post()
  create(@Body() createPlanSlotDto: CreatePlanSlotDto) {
    return this.planSlotsService.create(createPlanSlotDto);
  }

  @Get()
  findAll(@Query('planId') planId: number) {
    return this.planSlotsService.findAll(planId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planSlotsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlanSlotDto: Partial<CreatePlanSlotDto>
  ) {
    return this.planSlotsService.update(+id, updatePlanSlotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planSlotsService.remove(+id);
  }
} 