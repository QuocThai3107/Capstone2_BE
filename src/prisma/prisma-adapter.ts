/**
 * This adapter file provides a mapping between Prisma schema field names 
 * and the TypeScript code to maintain code consistency.
 */
import { PrismaClient } from '@prisma/client';

// Create a custom client with properites that match our TypeScript naming conventions
export class PrismaAdapter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Expose properties that match our TypeScript naming conventions
  get exercisepost() {
    return this.prisma.exercisepost;
  }

  get exerciseposttag() {
    return this.prisma.exerciseposttag;
  }

  // Add other models as needed
  get tag() {
    return this.prisma.tag;
  }

  get step() {
    return this.prisma.step;
  }

  get user() {
    return this.prisma.user;
  }

  get plan() {
    return this.prisma.plan;
  }

  get planslot() {
    return this.prisma.planslot;
  }

  // Access to the original prisma client
  get client() {
    return this.prisma;
  }
} 