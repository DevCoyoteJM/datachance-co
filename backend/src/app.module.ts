import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { LotteriesModule } from './lotteries/lotteries.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ScraperModule } from './scraper/scraper.module';
import { CalculatorModule } from './calculator/calculator.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    LotteriesModule,
    AnalyticsModule,
    ScraperModule,
    CalculatorModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
