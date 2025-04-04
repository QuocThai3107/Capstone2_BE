import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from './prisma-adapter';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private adapter: PrismaAdapter) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Expose the adapter properties directly on the service
  get exercisepost() {
    return this.adapter.exercisepost;
  }

  get exerciseposttag() {
    return this.adapter.exerciseposttag;
  }

  get tag() {
    return this.adapter.tag;
  }

  get step() {
    return this.adapter.step;
  }

  get plan() {
    return this.adapter.plan;
  }

  get planSlot() {
    return this.adapter.planSlot;
  }

  get user() {
    return this.adapter.user;
  }

  // Access to the original prisma client
  get client() {
    return this.adapter.client;
  }
} 