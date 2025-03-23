import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PlanSlotsService } from './plan-slots.service';
import { CreatePlanSlotDto } from './dto/create-plan-slot.dto';
import { UpdatePlanSlotDto } from './dto/update-plan-slot.dto';

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

  @Get(':plan_id/:no')
  findOne(
    @Param('plan_id') plan_id: string,
    @Param('no') no: string
  ) {
    return this.planSlotsService.findOne(+plan_id, no);
  }

  @Patch(':plan_id/:no')
  update(
    @Param('plan_id') plan_id: string,
    @Param('no') no: string,
    @Body() updatePlanSlotDto: UpdatePlanSlotDto
  ) {
    return this.planSlotsService.update(+plan_id, no, updatePlanSlotDto);
  }

  @Delete(':plan_id/:no')
  remove(
    @Param('plan_id') plan_id: string,
    @Param('no') no: string
  ) {
    return this.planSlotsService.remove(+plan_id, no);
  }
} 