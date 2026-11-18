import { Controller, Get, Query } from '@nestjs/common';
import { CalculatorService, GameType } from './calculator.service';

@Controller('api/calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Get('simulate')
  simulate(
    @Query('amount') amount?: string,
    @Query('gameType') gameType?: GameType,
    @Query('allSigns') allSigns?: string,
    @Query('customMultiplier') customMultiplier?: string,
    @Query('jackpot') jackpot?: string,
  ) {
    const betAmount = amount ? parseFloat(amount) : 2000;
    const isAllSigns = allSigns === 'true' || allSigns === '1';
    const resolvedGameType = (gameType as GameType) || 'CHANCE_TRADICIONAL';
    const parsedCustomMultiplier = customMultiplier ? parseFloat(customMultiplier) : undefined;
    const parsedJackpot = jackpot ? parseFloat(jackpot) : undefined;

    return this.calculatorService.calculate(
      betAmount,
      resolvedGameType,
      isAllSigns,
      parsedCustomMultiplier,
      parsedJackpot,
    );
  }
}
