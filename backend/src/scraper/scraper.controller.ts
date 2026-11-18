import { Controller, Get, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('sync')
  @Post('sync')
  async triggerManualSync() {
    return this.scraperService.syncLatestResults();
  }

  @Get('sync-all')
  @Post('sync-all')
  async triggerSyncAll() {
    return this.scraperService.syncAll();
  }
}
