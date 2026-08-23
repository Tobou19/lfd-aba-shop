import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { PrismaService } from '../prisma.service';
import { PdfModule } from '../pdf/pdf.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PdfModule, StorageModule],
  controllers: [ReportingController],
  providers: [ReportingService, PrismaService],
})
export class ReportingModule {}
