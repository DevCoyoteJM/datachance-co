import { Controller, Get, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('sync-daily')
  async syncDailyGet() {
    return this.scraperService.syncLatestResults();
  }

  @Post('sync-daily')
  async syncDailyPost() {
    return this.scraperService.syncLatestResults();
  }

  @Get('sync')
  async triggerManualSyncGet() {
    return this.scraperService.syncLatestResults();
  }

  @Post('sync')
  async triggerManualSyncPost() {
    return this.scraperService.syncLatestResults();
  }

  @Get('sync-all')
  async triggerSyncAllGet() {
    return this.scraperService.syncAll();
  }

  @Post('sync-all')
  async triggerSyncAllPost() {
    return this.scraperService.syncAll();
  }
}
