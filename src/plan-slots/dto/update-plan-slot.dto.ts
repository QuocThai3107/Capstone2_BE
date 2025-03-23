import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanSlotDto } from './create-plan-slot.dto';

export class UpdatePlanSlotDto extends PartialType(CreatePlanSlotDto) {} 