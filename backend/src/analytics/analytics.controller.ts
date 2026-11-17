import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('lottery/:id')
  async getLotteryStats(@Param('id') id: string) {
    return this.analyticsService.getLotteryStats(Number(id));
  }

  @Get('pyramid')
  async getPyramid(@Query('date') date?: string) {
    return this.analyticsService.calculateNumerologicalPyramid(date);
  }

  @Get('hybrid')
  async getHybridPrediction(
    @Query('lotteryId') lotteryId: string,
    @Query('date') date?: string,
  ) {
    return this.analyticsService.generateHybridPrediction(Number(lotteryId), date);
  }

  @Get('statistical')
  async getStatisticalPrediction(@Query('lotteryId') lotteryId: string) {
    return this.analyticsService.generateStatisticalPrediction(Number(lotteryId));
  }
}
