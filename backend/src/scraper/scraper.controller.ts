import { Controller, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('sync')
  async triggerManualSync() {
    return this.scraperService.syncLatestResults();
  }

  @Post('sync-all')
  async triggerSyncAll() {
    return this.scraperService.syncAll();
  }
}
