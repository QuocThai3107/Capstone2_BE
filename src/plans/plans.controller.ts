import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { GetUser, Public } from '../auth/decorator';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Public()
  @Get()
  findAll(@Query('user_id') queryUserId: string) {
    // Sử dụng user_id từ query parameter
    console.log('Received user_id query param:', queryUserId);
    
    // Đảm bảo chuyển đổi thành số
    const userId = queryUserId ? Number(queryUserId) : null;
    console.log('Converted userId:', userId, 'Type:', typeof userId);
    
    // Nếu không có userId, trả về mảng rỗng
    if (!userId) {
      console.log('No userId provided, returning empty array');
      return [];
    }
    
    console.log('Calling service with userId:', userId);
    return this.plansService.findAll(userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: Partial<CreatePlanDto>) {
    return this.plansService.update(+id, updatePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plansService.remove(+id);
  }
} 