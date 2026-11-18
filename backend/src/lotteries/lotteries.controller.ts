import { Controller, Get, Param, Query } from '@nestjs/common';
import { LotteriesService } from './lotteries.service';

@Controller()
export class LotteriesController {
  constructor(private readonly lotteriesService: LotteriesService) {}

  @Get('lotteries')
  async getLotteries(
    @Query('category') category?: string,
    @Query('schedule') schedule?: string,
  ) {
    return this.lotteriesService.findAll(category, schedule);
  }

  @Get('lotteries/:slug/history')
  async getLotteryHistory(
    @Param('slug') slug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.lotteriesService.getLotteryHistory(slug, {
      page,
      limit,
      search,
      startDate,
      endDate,
    });
  }

  @Get('lotteries/:slug')
  async getLotteryBySlug(@Param('slug') slug: string) {
    return this.lotteriesService.findBySlug(slug);
  }

  @Get('results')
  async getResults(
    @Query('lotteryId') lotteryId?: number,
    @Query('category') category?: string,
    @Query('schedule') schedule?: string,
    @Query('limit') limit?: number,
    @Query('date') date?: string,
  ) {
    return this.lotteriesService.findResults({
      lotteryId,
      category,
      schedule,
      limit,
      date,
    });
  }

  @Get('results/latest')
  async getLatestResults() {
    return this.lotteriesService.getLatestResultsGrouped();
  }
}
