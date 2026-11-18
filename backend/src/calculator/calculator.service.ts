import { Injectable } from '@nestjs/common';

export type GameType = 'CHANCE_TRADICIONAL' | 'SUPER_ASTRO' | 'BALOTO';

export interface MathematicalAnalysis {
  probabilityRatio: string;
  probabilityFloat: number;
  probabilityPercentage: string;
  rtpPercent: number;
  evPerPeso: number;
  houseEdgePercent: number;
  advantageParty: 'CASA' | 'JUGADOR';
  breakevenMultiplierGross: number;
  breakevenMultiplierNet: number;
  breakevenDescription: string;
}

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
  uvtValue: number;
  uvtThresholdCop: number;
  isTaxExempt: boolean;
  mathAnalysis: MathematicalAnalysis;
}

// UVT vigente Colombia 2026: $49.799 COP -> 48 UVT = $2.390.352 COP
export const UVT_VALUE_2026 = 49799;
export const RETENTION_THRESHOLD_COP = 48 * UVT_VALUE_2026; // $2.390.352 COP
export const RETENTION_RATE = 0.20;

// Modalidades para Chance Tradicional (Ley 643 de 2001)
const CHANCE_MODALITIES = [
  {
    key: 'DIRECTO_4',
    name: '4 Cifras Directo',
    multiplier: 4500,
    probRatio: '1 en 10.000',
    probFloat: 1 / 10000,
    description: 'Acierto de las 4 cifras en el mismo orden exacto.',
  },
  {
    key: 'COMBINADO_4',
    name: '4 Cifras Combinado',
    multiplier: 208,
    probRatio: '24 en 10.000 (1 en ~417)',
    probFloat: 24 / 10000,
    description: 'Acierto de las 4 cifras en cualquier orden.',
  },
  {
    key: 'DIRECTO_3',
    name: '3 Cifras Directo (Pata)',
    multiplier: 400,
    probRatio: '1 en 1.000',
    probFloat: 1 / 1000,
    description: 'Acierto de las 3 últimas cifras en el mismo orden.',
  },
  {
    key: 'COMBINADO_3',
    name: '3 Cifras Combinado',
    multiplier: 83,
    probRatio: '6 en 1.000 (1 en ~167)',
    probFloat: 6 / 1000,
    description: 'Acierto de las 3 últimas cifras en cualquier orden.',
  },
  {
    key: 'UNA_2',
    name: '2 Cifras (Uña)',
    multiplier: 50,
    probRatio: '1 en 100',
    probFloat: 1 / 100,
    description: 'Acierto de las 2 últimas cifras en el mismo orden.',
  },
  {
    key: 'UNA_1',
    name: '1 Cifra (Última Cifra)',
    multiplier: 5,
    probRatio: '1 en 10',
    probFloat: 1 / 10,
    description: 'Acierto de la última cifra exacta.',
  },
];

// Modalidades oficiales para Súper Astro
const ASTRO_MODALITIES = [
  {
    key: 'ASTRO_4_CIFRAS',
    name: '4 Cifras + Signo Zodiacal (Súper Pleno)',
    multiplier: 42000,
    probRatio: '1 en 120.000',
    probFloat: 1 / 120000,
    description: 'Acierto de las 4 cifras en orden exacto más el signo zodiacal ganador.',
  },
  {
    key: 'ASTRO_3_CIFRAS',
    name: '3 Cifras + Signo Zodiacal (Pleno)',
    multiplier: 1000,
    probRatio: '1 en 12.000',
    probFloat: 1 / 12000,
    description: 'Acierto de las 3 últimas cifras en orden exacto más el signo zodiacal ganador.',
  },
  {
    key: 'ASTRO_2_CIFRAS',
    name: '2 Cifras + Signo Zodiacal',
    multiplier: 100,
    probRatio: '1 en 1.200',
    probFloat: 1 / 1200,
    description: 'Acierto de las 2 últimas cifras en orden exacto más el signo zodiacal ganador.',
  },
];

@Injectable()
export class CalculatorService {
  calculate(
    betAmount: number,
    gameType: GameType = 'CHANCE_TRADICIONAL',
    allSigns = false,
    customMultiplier?: number,
    balotoJackpotMillones?: number,
  ): CalculationResult[] {
    const safeBet = Math.max(500, betAmount);
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });

    // Caso 1: BALOTO / REVANCHA
    if (gameType === 'BALOTO') {
      const jackpotCop = (balotoJackpotMillones || 18500) * 1_000_000;
      const probFloat = 1 / 15401568;
      const grossPrize = jackpotCop;
      const withholdingTax = Math.round(grossPrize * RETENTION_RATE);
      const netPrize = grossPrize - withholdingTax;
      const ticketCost = 5700; // Costo boleto Baloto en Colombia
      const effectiveMultiplier = Math.round(jackpotCop / ticketCost);

      const rtp = probFloat * (jackpotCop / ticketCost) * 100;
      const evPerPeso = probFloat * (netPrize / ticketCost) - 1;
      const advantageParty = evPerPeso > 0 ? 'JUGADOR' : 'CASA';

      const mathAnalysis: MathematicalAnalysis = {
        probabilityRatio: '1 en 15.401.568',
        probabilityFloat: probFloat,
        probabilityPercentage: (probFloat * 100).toFixed(8) + '%',
        rtpPercent: parseFloat(rtp.toFixed(2)),
        evPerPeso: parseFloat(evPerPeso.toFixed(4)),
        houseEdgePercent: parseFloat((100 - rtp).toFixed(2)),
        advantageParty,
        breakevenMultiplierGross: 15401568,
        breakevenMultiplierNet: Math.round(15401568 / 0.8),
        breakevenDescription: `El acumulado bruto debe superar $${Math.round(
          (15401568 * ticketCost) / 0.8 / 1_000_000,
        ).toLocaleString('es-CO')} Millones para que el EV neto supere $0.`,
      };

      return [
        {
          modality: 'BALOTO_JACKPOT',
          modalityName: 'Premio Mayor Baloto (5 Balotas + Superbalota)',
          gameType: 'BALOTO',
          gameName: 'Baloto Colombia',
          betAmount: ticketCost,
          multiplier: effectiveMultiplier,
          effectiveMultiplier,
          grossPrize,
          withholdingTax,
          netPrize,
          formattedBet: formatter.format(ticketCost),
          formattedGross: formatter.format(grossPrize),
          formattedTax: formatter.format(withholdingTax),
          formattedNet: formatter.format(netPrize),
          notes: `Aplica retención en la fuente del 20% (supera el umbral legal de 48 UVT = $${RETENTION_THRESHOLD_COP.toLocaleString('es-CO')} COP).`,
          uvtValue: UVT_VALUE_2026,
          uvtThresholdCop: RETENTION_THRESHOLD_COP,
          isTaxExempt: false,
          mathAnalysis,
        },
      ];
    }

    // Caso 2: SÚPER ASTRO
    if (gameType === 'SUPER_ASTRO') {
      const signsCount = allSigns ? 12 : 1;
      const betPerSign = safeBet / signsCount;

      return ASTRO_MODALITIES.map((mod) => {
        const mult = customMultiplier || mod.multiplier;
        const grossPrize = Math.round(betPerSign * mult);
        const isTaxExempt = grossPrize < RETENTION_THRESHOLD_COP;
        const withholdingTax = isTaxExempt ? 0 : Math.round(grossPrize * RETENTION_RATE);
        const netPrize = grossPrize - withholdingTax;
        const effectiveMultiplier = allSigns ? Math.round(mult / 12) : mult;

        const effectiveProb = allSigns ? mod.probFloat * 12 : mod.probFloat;
        const rtp = effectiveProb * effectiveMultiplier * 100;
        const evPerPeso = effectiveProb * (netPrize / safeBet) - 1;
        const advantageParty = evPerPeso > 0 ? 'JUGADOR' : 'CASA';

        const mathAnalysis: MathematicalAnalysis = {
          probabilityRatio: allSigns ? `${mod.probRatio} (x12 por todos los signos)` : mod.probRatio,
          probabilityFloat: effectiveProb,
          probabilityPercentage: (effectiveProb * 100).toFixed(4) + '%',
          rtpPercent: parseFloat(rtp.toFixed(2)),
          evPerPeso: parseFloat(evPerPeso.toFixed(4)),
          houseEdgePercent: parseFloat((100 - rtp).toFixed(2)),
          advantageParty,
          breakevenMultiplierGross: Math.round(1 / effectiveProb),
          breakevenMultiplierNet: Math.round((1 / effectiveProb) / (1 - RETENTION_RATE)),
          breakevenDescription: `Se requeriría un multiplicador superior a ${Math.round(
            (1 / effectiveProb) / (1 - RETENTION_RATE),
          ).toLocaleString('es-CO')}x para lograr un Retorno Esperado Positivo (EV > 0).`,
        };

        let notes = allSigns
          ? `Apuesta distribuida en los 12 signos ($${Math.round(betPerSign).toLocaleString('es-CO')} c/u). Garantiza acierto del signo; paga ${effectiveMultiplier.toLocaleString('es-CO')}x la apuesta total.`
          : `Paga ${mult.toLocaleString('es-CO')} veces lo apostado al acertar tu signo elegido.`;

        if (!isTaxExempt) {
          notes += ` Aplica retención en la fuente del 20% (supera 48 UVT = $${RETENTION_THRESHOLD_COP.toLocaleString('es-CO')} COP).`;
        } else {
          notes += ' Libre de retención en la fuente ($0 Exento).';
        }

        return {
          modality: mod.key,
          modalityName: mod.name,
          gameType: 'SUPER_ASTRO',
          gameName: allSigns ? 'Súper Astro (12 Signos)' : 'Súper Astro (1 Signo)',
          betAmount: safeBet,
          multiplier: mult,
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
          uvtValue: UVT_VALUE_2026,
          uvtThresholdCop: RETENTION_THRESHOLD_COP,
          isTaxExempt,
          mathAnalysis,
        };
      });
    }

    // Caso 3: CHANCES TRADICIONALES
    return CHANCE_MODALITIES.map((mod) => {
      const mult = customMultiplier && mod.key === 'DIRECTO_4' ? customMultiplier : mod.multiplier;
      const grossPrize = safeBet * mult;
      const isTaxExempt = grossPrize < RETENTION_THRESHOLD_COP;
      const withholdingTax = isTaxExempt ? 0 : Math.round(grossPrize * RETENTION_RATE);
      const netPrize = grossPrize - withholdingTax;

      const rtp = mod.probFloat * mult * 100;
      const evPerPeso = mod.probFloat * (netPrize / safeBet) - 1;
      const advantageParty = evPerPeso > 0 ? 'JUGADOR' : 'CASA';

      const mathAnalysis: MathematicalAnalysis = {
        probabilityRatio: mod.probRatio,
        probabilityFloat: mod.probFloat,
        probabilityPercentage: (mod.probFloat * 100).toFixed(4) + '%',
        rtpPercent: parseFloat(rtp.toFixed(2)),
        evPerPeso: parseFloat(evPerPeso.toFixed(4)),
        houseEdgePercent: parseFloat((100 - rtp).toFixed(2)),
        advantageParty,
        breakevenMultiplierGross: Math.round(1 / mod.probFloat),
        breakevenMultiplierNet: Math.round((1 / mod.probFloat) / (1 - RETENTION_RATE)),
        breakevenDescription: `Punto de equilibrio Jerry Selbee: El premio debe pagar al menos ${Math.round(
          (1 / mod.probFloat) / (1 - RETENTION_RATE),
        ).toLocaleString('es-CO')}x para superar el costo de la apuesta y los impuestos de Colombia.`,
      };

      let notes = `Paga ${mult.toLocaleString('es-CO')} veces el valor apostado por Ley 643/2001.`;
      if (!isTaxExempt) {
        notes += ` Aplica retención en la fuente del 20% (supera 48 UVT = $${RETENTION_THRESHOLD_COP.toLocaleString('es-CO')} COP).`;
      } else {
        notes += ' Exento de retención en la fuente ($0 Exento, inferior a 48 UVT).';
      }

      return {
        modality: mod.key,
        modalityName: mod.name,
        gameType: 'CHANCE_TRADICIONAL',
        gameName: 'Chance Tradicional',
        betAmount: safeBet,
        multiplier: mult,
        effectiveMultiplier: mult,
        grossPrize,
        withholdingTax,
        netPrize,
        formattedBet: formatter.format(safeBet),
        formattedGross: formatter.format(grossPrize),
        formattedTax: formatter.format(withholdingTax),
        formattedNet: formatter.format(netPrize),
        notes,
        uvtValue: UVT_VALUE_2026,
        uvtThresholdCop: RETENTION_THRESHOLD_COP,
        isTaxExempt,
        mathAnalysis,
      };
    });
  }
}
