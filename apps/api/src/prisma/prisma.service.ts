import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { getPrismaClient, type ExtendedPrismaClient } from '../config/database.config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: ExtendedPrismaClient = getPrismaClient();

  // Model delegates — reads route to replica, writes route to primary automatically
  get user() { return this.client.user; }
  get session() { return this.client.session; }
  get manga() { return this.client.manga; }
  get chapter() { return this.client.chapter; }
  get page() { return this.client.page; }
  get comment() { return this.client.comment; }

  // Forward $transaction so services can use atomic operations across the primary
  get $transaction() {
    return this.client.$transaction.bind(this.client);
  }

  async onModuleInit() {
    await (this.client as any).$connect();
  }

  async onModuleDestroy() {
    await (this.client as any).$disconnect();
  }
}
