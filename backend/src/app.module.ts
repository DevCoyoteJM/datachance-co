import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { LotteriesModule } from './lotteries/lotteries.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ScraperModule } from './scraper/scraper.module';
import { CalculatorModule } from './calculator/calculator.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    LotteriesModule,
    AnalyticsModule,
    ScraperModule,
    CalculatorModule,
  ],
})
export class AppModule {}
