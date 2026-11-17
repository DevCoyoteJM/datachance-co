import { Injectable } from '@nestjs/common';

export type GameType = 'CHANCE_TRADICIONAL' | 'SUPER_ASTRO';

export interface CalculationResult {
  modality: string;
  modalityName: string;
  gameType: GameType;
  gameName: string;
  betAmount: number;
  multiplier: number;
  effectiveMultiplier: number;
  grossPrize: number;
  withholdingTax: number;
  netPrize: number;
  formattedBet: string;
  formattedGross: string;
  formattedTax: string;
  formattedNet: string;
  notes: string;
  allSigns?: boolean;
}

// Modalidades para Chance Tradicional (Ley 643 de 2001 y decretos de Coljuegos)
const CHANCE_MODALITIES = [
  {
    key: 'DIRECTO_4',
    name: '4 Cifras Directo',
    multiplier: 4500,
    description: 'Acierto de las 4 cifras en el mismo orden exacto.',
  },
  {
    key: 'COMBINADO_4',
    name: '4 Cifras Combinado',
    multiplier: 208,
    description: 'Acierto de las 4 cifras en cualquier orden.',
  },
  {
    key: 'DIRECTO_3',
    name: '3 Cifras Directo (Pata)',
    multiplier: 400,
    description: 'Acierto de las 3 últimas cifras en el mismo orden.',
  },
  {
    key: 'COMBINADO_3',
    name: '3 Cifras Combinado',
    multiplier: 83,
    description: 'Acierto de las 3 últimas cifras en cualquier orden.',
  },
  {
    key: 'UNA_2',
    name: '2 Cifras (Uña)',
    multiplier: 50,
    description: 'Acierto de las 2 últimas cifras en el mismo orden.',
  },
  {
    key: 'UNA_1',
    name: '1 Cifra (Última Cifra)',
    multiplier: 5,
    description: 'Acierto de la última cifra exacta.',
  },
];

// Modalidades oficiales para Súper Astro (Astro Sol y Astro Luna - Corredor Empresarial / Coljuegos)
const ASTRO_MODALITIES = [
  {
    key: 'ASTRO_4_CIFRAS',
    name: '4 Cifras + Signo Zodiacal (Súper Pleno)',
    multiplier: 42000,
    description: 'Acierto de las 4 cifras en orden exacto más el signo zodiacal ganador.',
  },
  {
    key: 'ASTRO_3_CIFRAS',
    name: '3 Cifras + Signo Zodiacal (Pleno)',
    multiplier: 1000,
    description: 'Acierto de las 3 últimas cifras en orden exacto más el signo zodiacal ganador.',
  },
  {
    key: 'ASTRO_2_CIFRAS',
    name: '2 Cifras + Signo Zodiacal',
    multiplier: 100,
    description: 'Acierto de las 2 últimas cifras en orden exacto más el signo zodiacal ganador.',
  },
];

// Umbral retención en la fuente Colombia 2026: 48 UVT (~ $2.390.352 COP)
const RETENTION_THRESHOLD_COP = 2390352;
const RETENTION_RATE = 0.20;

@Injectable()
export class CalculatorService {
  calculate(
    betAmount: number,
    gameType: GameType = 'CHANCE_TRADICIONAL',
    allSigns = false,
  ): CalculationResult[] {
    const safeBet = Math.max(500, betAmount);
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });

    if (gameType === 'SUPER_ASTRO') {
      // En Súper Astro, si se juegan "Todos los signos", la apuesta total se divide entre los 12 signos del zodiaco
      const signsCount = allSigns ? 12 : 1;
      const betPerSign = safeBet / signsCount;

      return ASTRO_MODALITIES.map((mod) => {
        const grossPrize = Math.round(betPerSign * mod.multiplier);
        const withholdingTax =
          grossPrize >= RETENTION_THRESHOLD_COP ? Math.round(grossPrize * RETENTION_RATE) : 0;
        const netPrize = grossPrize - withholdingTax;
        const effectiveMultiplier = allSigns ? Math.round(mod.multiplier / 12) : mod.multiplier;

        let notes = allSigns
          ? `Apuesta distribuida en los 12 signos ($${Math.round(betPerSign).toLocaleString('es-CO')} c/u). Garantiza acierto del signo; paga ${effectiveMultiplier.toLocaleString('es-CO')}x la apuesta total.`
          : `Paga ${mod.multiplier.toLocaleString('es-CO')} veces lo apostado al acertar tu signo elegido.`;

        if (withholdingTax > 0) {
          notes += ` Aplica retención en la fuente del 20% (supera 48 UVT = $${RETENTION_THRESHOLD_COP.toLocaleString('es-CO')} COP).`;
        } else {
          notes += ' Libre de retención en la fuente.';
        }

        return {
          modality: mod.key,
          modalityName: mod.name,
          gameType: 'SUPER_ASTRO',
          gameName: allSigns ? 'Súper Astro (12 Signos)' : 'Súper Astro (1 Signo)',
          betAmount: safeBet,
          multiplier: mod.multiplier,
          effectiveMultiplier,
          grossPrize,
          withholdingTax,
          netPrize,
          formattedBet: formatter.format(safeBet),
          formattedGross: formatter.format(grossPrize),
          formattedTax: formatter.format(withholdingTax),
          formattedNet: formatter.format(netPrize),
          notes,
          allSigns,
        };
      });
    }

    // Por defecto: Chances tradicionales de Colombia (Dorado, Paisita, Chontico, Antioqueñita, etc.)
    return CHANCE_MODALITIES.map((mod) => {
      const grossPrize = safeBet * mod.multiplier;
      const withholdingTax =
        grossPrize >= RETENTION_THRESHOLD_COP ? Math.round(grossPrize * RETENTION_RATE) : 0;
      const netPrize = grossPrize - withholdingTax;

      let notes = `Paga ${mod.multiplier.toLocaleString('es-CO')} veces el valor apostado por Ley 643/2001.`;
      if (withholdingTax > 0) {
        notes += ` Aplica retención en la fuente del 20% por superar el umbral de 48 UVT ($${RETENTION_THRESHOLD_COP.toLocaleString('es-CO')} COP).`;
      } else {
        notes += ' Exento de retención en la fuente (inferior al umbral de 48 UVT).';
      }

      return {
        modality: mod.key,
        modalityName: mod.name,
        gameType: 'CHANCE_TRADICIONAL',
        gameName: 'Chance Tradicional',
        betAmount: safeBet,
        multiplier: mod.multiplier,
        effectiveMultiplier: mod.multiplier,
        grossPrize,
        withholdingTax,
        netPrize,
        formattedBet: formatter.format(safeBet),
        formattedGross: formatter.format(grossPrize),
        formattedTax: formatter.format(withholdingTax),
        formattedNet: formatter.format(netPrize),
        notes,
      };
    });
  }
}
