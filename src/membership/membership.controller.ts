import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorator';

@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get('gym/:userId')
  findGymMemberships(@Param('userId') userId: string) {
    console.log('Accessing gym memberships for userId:', userId);
    return this.membershipService.findByUserId(+userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @GetUser('user_id') userId: number,
    @Body() createMembershipDto: CreateMembershipDto
  ) {
    createMembershipDto.user_id = userId;
    return this.membershipService.create(createMembershipDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.membershipService.findAll();
  }

  @Get('my-memberships')
  @UseGuards(JwtAuthGuard)
  findMyMemberships(@GetUser('user_id') userId: number) {
    return this.membershipService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membershipService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMembershipDto: UpdateMembershipDto
  ) {
    return this.membershipService.update(+id, updateMembershipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membershipService.remove(+id);
  }
} 