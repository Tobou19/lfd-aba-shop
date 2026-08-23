import { Module } from '@nestjs/common';
import { CentersController } from './centers.controller';
import { CentersService } from './centers.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CentersController],
  providers: [CentersService, PrismaService],
  exports: [CentersService],
})
export class CentersModule {}
