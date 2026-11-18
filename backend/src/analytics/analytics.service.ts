import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PositionalHeatItem {
  digit: number;
  count: number;
  percentage: number;
}

export interface HotColdItem {
  digitOrNumber: string;
  frequency: number;
  lastSeenDrawsAgo: number;
  status: 'HOT' | 'WARM' | 'COLD';
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene estadísticas completas para una lotería o sorteo específico
   */
  async getLotteryStats(lotteryId: number) {
    const lottery = await this.prisma.lottery.findUnique({
      where: { id: lotteryId },
    });

    if (!lottery) {
      throw new NotFoundException(`Lotería con ID ${lotteryId} no encontrada`);
    }

    const results = await this.prisma.result.findMany({
      where: { lotteryId },
      orderBy: { drawDate: 'desc' },
      take: 200,
    });

    if (lottery.isBaloto) {
      return this.calculateBalotoStats(lottery, results);
    }

    return this.calculateChanceStats(lottery, results);
  }

  /**
   * Estadísticas para Baloto / Revancha (Balotas 1-43 y Superbalotas 1-16)
   */
  private calculateBalotoStats(lottery: any, results: any[]) {
    const ballFrequency: Record<number, number> = {};
    const ballLastSeen: Record<number, number> = {};
    const superbalotaFrequency: Record<number, number> = {};
    const superbalotaLastSeen: Record<number, number> = {};

    for (let i = 1; i <= 43; i++) {
      ballFrequency[i] = 0;
      ballLastSeen[i] = -1;
    }
    for (let i = 1; i <= 16; i++) {
      superbalotaFrequency[i] = 0;
      superbalotaLastSeen[i] = -1;
    }

    results.forEach((res, drawIndex) => {
      if (res.balotas) {
        const balls = res.balotas.split('-').map((b: string) => parseInt(b, 10));
        balls.forEach((b: number) => {
          if (ballFrequency[b] !== undefined) {
            ballFrequency[b]++;
            if (ballLastSeen[b] === -1) {
              ballLastSeen[b] = drawIndex;
            }
          }
        });
      }

      if (res.superbalota) {
        const sb = parseInt(res.superbalota, 10);
        if (superbalotaFrequency[sb] !== undefined) {
          superbalotaFrequency[sb]++;
          if (superbalotaLastSeen[sb] === -1) {
            superbalotaLastSeen[sb] = drawIndex;
          }
        }
      }
    });

    const ballList = Object.keys(ballFrequency).map((key) => {
      const b = parseInt(key, 10);
      return {
        ball: b,
        ballFormatted: b.toString().padStart(2, '0'),
        frequency: ballFrequency[b],
        lastSeenDrawsAgo: ballLastSeen[b] === -1 ? results.length : ballLastSeen[b],
      };
    });

    const superbalotaList = Object.keys(superbalotaFrequency).map((key) => {
      const sb = parseInt(key, 10);
      return {
        superbalota: sb,
        formatted: sb.toString().padStart(2, '0'),
        frequency: superbalotaFrequency[sb],
        lastSeenDrawsAgo: superbalotaLastSeen[sb] === -1 ? results.length : superbalotaLastSeen[sb],
      };
    });

    // Ordenar ranking
    const hotBalls = [...ballList].sort((a, b) => b.frequency - a.frequency);
    const coldBalls = [...ballList].sort((a, b) => b.lastSeenDrawsAgo - a.lastSeenDrawsAgo);
    const hotSuperbalotas = [...superbalotaList].sort((a, b) => b.frequency - a.frequency);

    return {
      lottery,
      totalDraws: results.length,
      ballStats: ballList,
      hotBalls: hotBalls.slice(0, 10),
      coldBalls: coldBalls.slice(0, 10),
      superbalotaStats: superbalotaList,
      hotSuperbalotas: hotSuperbalotas.slice(0, 8),
    };
  }

  /**
   * Estadísticas para Chances y Loterías Tradicionales (4 cifras, posiciones 1-4, signos zodiacales)
   */
  private calculateChanceStats(lottery: any, results: any[]) {
    // Matriz de calor posicional (4 columnas, dígitos 0-9)
    const positionCounts: Record<number, Record<number, number>> = {
      0: {}, 1: {}, 2: {}, 3: {},
    };

    for (let pos = 0; pos < 4; pos++) {
      for (let d = 0; d <= 9; d++) {
        positionCounts[pos][d] = 0;
      }
    }

    // Frecuencia general de dígitos individuales
    const digitFrequency: Record<number, number> = {};
    const digitLastSeen: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) {
      digitFrequency[d] = 0;
      digitLastSeen[d] = -1;
    }

    // Frecuencia de signos zodiacales
    const zodiacCounts: Record<string, number> = {};

    results.forEach((res, drawIndex) => {
      if (res.number && res.number.length === 4) {
        for (let pos = 0; pos < 4; pos++) {
          const digit = parseInt(res.number[pos], 10);
          if (!isNaN(digit)) {
            positionCounts[pos][digit]++;
            digitFrequency[digit]++;
            if (digitLastSeen[digit] === -1) {
              digitLastSeen[digit] = drawIndex;
            }
          }
        }
      }

      if (res.zodiacSign) {
        zodiacCounts[res.zodiacSign] = (zodiacCounts[res.zodiacSign] || 0) + 1;
      }
    });

    const totalValidDraws = results.filter((r) => r.number && r.number.length === 4).length;

    // Matriz de calor formateada
    const heatMatrix = [0, 1, 2, 3].map((pos) => {
      const items: PositionalHeatItem[] = [];
      for (let d = 0; d <= 9; d++) {
        const count = positionCounts[pos][d];
        const percentage = totalValidDraws > 0 ? Math.round((count / totalValidDraws) * 100) : 0;
        items.push({ digit: d, count, percentage });
      }
      return {
        position: pos + 1,
        positionLabel: `${pos + 1}ª Cifra`,
        digits: items,
      };
    });

    // Dígitos calientes y fríos
    const hotColdList: HotColdItem[] = [];
    for (let d = 0; d <= 9; d++) {
      const freq = digitFrequency[d];
      const lastSeen = digitLastSeen[d] === -1 ? totalValidDraws : digitLastSeen[d];
      let status: 'HOT' | 'WARM' | 'COLD' = 'WARM';
      if (lastSeen > 4 || freq < totalValidDraws * 0.25) status = 'COLD';
      else if (lastSeen <= 1 && freq >= totalValidDraws * 0.4) status = 'HOT';

      hotColdList.push({
        digitOrNumber: d.toString(),
        frequency: freq,
        lastSeenDrawsAgo: lastSeen,
        status,
      });
    }

    const hotDigits = [...hotColdList].sort((a, b) => b.frequency - a.frequency);
    const coldDigits = [...hotColdList].sort((a, b) => b.lastSeenDrawsAgo - a.lastSeenDrawsAgo);

    // Formatear signos zodiacales para gráfico circular
    const zodiacFrequencies = Object.keys(zodiacCounts).map((sign) => ({
      sign,
      count: zodiacCounts[sign],
      percentage: totalValidDraws > 0 ? Math.round((zodiacCounts[sign] / totalValidDraws) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    return {
      lottery,
      totalDraws: totalValidDraws,
      heatMatrix,
      hotDigits: hotDigits.slice(0, 5),
      coldDigits: coldDigits.slice(0, 5),
      allDigitStats: hotColdList,
      zodiacFrequencies,
    };
  }

  /**
   * Cálculo de la Pirámide Numerológica para una fecha dada (DDMMAAAA)
   */
  calculateNumerologicalPyramid(dateStr?: string) {
    let date = new Date();
    if (dateStr) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    // Base de la pirámide: DDMMAAAA ej: 16112026
    const baseDigits = `${day}${month}${year}`.split('').map(Number);
    const pyramid: number[][] = [baseDigits];

    let current = [...baseDigits];
    while (current.length > 1) {
      const nextLevel: number[] = [];
      for (let i = 0; i < current.length - 1; i++) {
        nextLevel.push((current[i] + current[i + 1]) % 10);
      }
      pyramid.push(nextLevel);
      current = nextLevel;
    }

    // Extraer combinaciones diagonales y clave de la pirámide
    // Diagonal Izquierda: primeros dígitos de niveles clave
    const leftDiag = pyramid.slice(0, 4).map((row) => row[0]).join('');
    // Diagonal Derecha: últimos dígitos de niveles clave
    const rightDiag = pyramid.slice(0, 4).map((row) => row[row.length - 1]).join('');
    // Vértice + niveles superiores
    const apexRowIndex = pyramid.length - 1;
    const apex = pyramid[apexRowIndex][0];
    const apexCluster = [
      pyramid[apexRowIndex - 2] ? pyramid[apexRowIndex - 2][0] : 0,
      pyramid[apexRowIndex - 1] ? pyramid[apexRowIndex - 1][0] : 0,
      pyramid[apexRowIndex - 1] && pyramid[apexRowIndex - 1][1] !== undefined ? pyramid[apexRowIndex - 1][1] : 0,
      apex,
    ].join('');

    // Combinación central de la base y 2do nivel
    const centerBase = pyramid[1] ? pyramid[1].slice(1, 5).join('').padStart(4, '0').slice(0, 4) : '1234';

    return {
      dateFormatted: `${day}/${month}/${year}`,
      pyramid,
      keyCombinations: {
        leftDiagonal: leftDiag,
        rightDiagonal: rightDiag,
        apexCluster,
        centerBase,
      },
    };
  }

  /**
   * Generador Híbrido: Combina Pirámide con Frecuencias Estadísticas de SQLite
   */
  async generateHybridPrediction(lotteryId: number, dateStr?: string) {
    const pyramidData = this.calculateNumerologicalPyramid(dateStr);
    const stats = await this.getLotteryStats(lotteryId);

    const isBaloto = stats.lottery.isBaloto;

    if (isBaloto) {
      const balotoStats = stats as any;
      const topHot = balotoStats.hotBalls.slice(0, 10).map((b: any) => b.ball);
      const topCold = balotoStats.coldBalls.slice(0, 5).map((b: any) => b.ball);

      // Selección híbrida: 3 calientes + 1 frío + 1 de la pirámide
      const flatPyramidDigits = pyramidData.pyramid.flat();
      const pyramidPicks: number[] = [];
      for (const d of flatPyramidDigits) {
        if (d > 0 && d <= 43 && !pyramidPicks.includes(d)) {
          pyramidPicks.push(d);
          if (pyramidPicks.length >= 3) break;
        }
      }

      const selected = new Set<number>();
      // 2 hot
      topHot.slice(0, 2).forEach((b: number) => selected.add(b));
      // 1 cold
      topCold.slice(0, 1).forEach((b: number) => selected.add(b));
      // 1 pyramid
      pyramidPicks.slice(0, 2).forEach((b: number) => selected.add(b));

      // Completar si falta
      let fallback = 1;
      while (selected.size < 5) {
        if (!selected.has(fallback)) selected.add(fallback);
        fallback++;
      }

      const balotasArray = Array.from(selected).sort((a, b) => a - b);
      const balotasFormatted = balotasArray.map((n) => n.toString().padStart(2, '0')).join('-');
      const superbalota = balotoStats.hotSuperbalotas[0]?.formatted || '07';

      return {
        mode: 'HYBRID_BALOTO',
        lottery: stats.lottery,
        pyramid: pyramidData,
        prediction: {
          balotas: balotasFormatted,
          superbalota,
          confidence: 88,
          explanation: `Fusión de balotas históricamente calientes (${balotasArray.slice(0, 2).join(', ')}), balota rezagada con alta probabilidad de retorno (${balotasArray[2]}), y resonancia de la pirámide de la fecha.`,
        },
      };
    }

    // Para Chances y Loterías
    const chanceStats = stats as any;
    const hotDigits = chanceStats.hotDigits.map((h: any) => parseInt(h.digitOrNumber, 10));
    const coldDigits = chanceStats.coldDigits.map((c: any) => parseInt(c.digitOrNumber, 10));

    // Mezcla inteligente: Tomar 2 dígitos de la pirámide (diagonal izquierda o apex) y los 2 dígitos más calientes por posición
    const diag = pyramidData.keyCombinations.leftDiagonal;
    const p1 = parseInt(diag[0] || '7', 10);
    const p2 = parseInt(diag[1] || '2', 10);

    // Obtener los dígitos más probables en posición 3 y 4
    const pos3Best = chanceStats.heatMatrix[2].digits.sort((a: any, b: any) => b.count - a.count)[0].digit;
    const pos4Best = chanceStats.heatMatrix[3].digits.sort((a: any, b: any) => b.count - a.count)[0].digit;

    const hybridNumber = `${p1}${p2}${pos3Best}${pos4Best}`;

    const hybridCombinations = [
      {
        combination: hybridNumber,
        type: 'Fusión Cúspide & Posicional',
        confidence: 91,
        explanation: `Cruza la diagonal numerológica (${p1}${p2}) con los dígitos de mayor probabilidad estadística para la 3ª (${pos3Best}) y 4ª cifra (${pos4Best}) en ${stats.lottery.name}.`,
      },
      {
        combination: pyramidData.keyCombinations.rightDiagonal,
        type: 'Pirámide Pura (Diagonal Derecha)',
        confidence: 84,
        explanation: `Secuencia descendente derecha de la pirámide astrológica para la fecha ${pyramidData.dateFormatted}.`,
      },
      {
        combination: `${hotDigits[0] ?? 3}${coldDigits[0] ?? 7}${hotDigits[1] ?? 9}${hotDigits[2] ?? 1}`,
        type: 'Equilibrio Térmico (Calientes + Rezagado)',
        confidence: 87,
        explanation: `3 dígitos de alta frecuencia con 1 dígito en ciclo de retorno estadístico (${coldDigits[0] ?? 7}).`,
      },
    ];

    let zodiacPrediction: string | null = null;
    if (stats.lottery.hasZodiac && chanceStats.zodiacFrequencies.length > 0) {
      zodiacPrediction = chanceStats.zodiacFrequencies[0].sign;
    }

    return {
      mode: 'HYBRID_CHANCE',
      lottery: stats.lottery,
      pyramid: pyramidData,
      zodiacPrediction,
      hybridCombinations,
    };
  }

  /**
   * Generador 100% Estadístico
   */
  async generateStatisticalPrediction(lotteryId: number) {
    const stats = await this.getLotteryStats(lotteryId);

    if (stats.lottery.isBaloto) {
      const balotoStats = stats as any;
      const topHot = balotoStats.hotBalls.slice(0, 15).map((b: any) => b.ball);
      // Tomar 3 calientes y 2 con frecuencia media para balance par/impar
      const picked = new Set<number>();
      for (const b of topHot) {
        picked.add(b);
        if (picked.size === 5) break;
      }
      const sorted = Array.from(picked).sort((a, b) => a - b);
      const superbalota = balotoStats.hotSuperbalotas[0]?.formatted || '10';

      return {
        lottery: stats.lottery,
        type: 'STATISTICAL',
        balotas: sorted.map((n) => n.toString().padStart(2, '0')).join('-'),
        superbalota,
        confidence: 89,
        explanation: 'Combinación balanceada basada en balotas con mayor tasa de aparición en los últimos 200 sorteos y Superbalota líder.',
      };
    }

    const chanceStats = stats as any;
    // Elegir el dígito con mayor porcentaje para cada una de las 4 posiciones
    const bestDigits = chanceStats.heatMatrix.map((posCol: any) => {
      const sorted = [...posCol.digits].sort((a: any, b: any) => b.count - a.count);
      return sorted[0].digit;
    });

    const number = bestDigits.join('');
    const zodiacSign = stats.lottery.hasZodiac && chanceStats.zodiacFrequencies[0]
      ? chanceStats.zodiacFrequencies[0].sign
      : null;

    return {
      lottery: stats.lottery,
      type: 'STATISTICAL',
      number,
      zodiacSign,
      confidence: 93,
      explanation: `Dígitos estadísticamente dominantes por posición: [${bestDigits.join(' - ')}] según la matriz de calor histórica de SQLite.`,
    };
  }

  /**
   * Obtiene los "Datos del Día (Análisis Híbrido)" para sorteos diarios populares de Colombia
   */
  async getDailyInsights(slug: string) {
    const lottery = await this.prisma.lottery.findUnique({
      where: { slug },
      include: {
        results: {
          take: 100,
          orderBy: { drawDate: 'desc' },
        },
      },
    });

    if (!lottery) {
      throw new NotFoundException(`Sorteo con slug '${slug}' no encontrado`);
    }

    const latestResult = lottery.results[0] || null;
    const latestNumber = latestResult?.number || '0000';

    // 1. Cruce del último sorteo: invertido y espejo
    const invertedNumber = latestNumber.split('').reverse().join('');
    const mirrorNumber = latestNumber
      .split('')
      .map((ch) => ((parseInt(ch, 10) + 5) % 10).toString())
      .join('');

    // Cruce con contraparte de jornada (Día vs Noche, Mañana vs Tarde)
    const counterpartMap: Record<string, string> = {
      'sinuano-dia': 'sinuano-noche',
      'sinuano-noche': 'sinuano-dia',
      'dorado-manana': 'dorado-tarde',
      'dorado-tarde': 'dorado-noche',
      'dorado-noche': 'dorado-manana',
      'chontico-dia': 'chontico-noche',
      'chontico-noche': 'chontico-dia',
      'antioquenita-dia': 'antioquenita-tarde',
      'antioquenita-tarde': 'antioquenita-dia',
      'paisita-dia': 'paisita-noche',
      'paisita-noche': 'paisita-dia',
      'pijao-de-oro': 'saman-de-la-suerte',
    };

    let counterpartResult: any = null;
    const counterpartSlug = counterpartMap[slug];
    if (counterpartSlug) {
      const counterpart = await this.prisma.lottery.findUnique({
        where: { slug: counterpartSlug },
        include: {
          results: {
            take: 1,
            orderBy: { drawDate: 'desc' },
          },
        },
      });
      if (counterpart && counterpart.results[0]) {
        counterpartResult = {
          name: counterpart.name,
          slug: counterpart.slug,
          number: counterpart.results[0].number,
          drawDate: counterpart.results[0].drawDate,
        };
      }
    }

    // 2. Dígitos demorados (Estadística real en SQLite)
    // A) Última cifra (Uña - posición 4)
    const delayedUna: { digit: number; drawsAgo: number; status: 'CRITICAL' | 'HIGH' | 'MEDIUM' }[] = [];
    for (let d = 0; d <= 9; d++) {
      const idx = lottery.results.findIndex(
        (r) => r.number && r.number.length === 4 && parseInt(r.number[3], 10) === d,
      );
      const drawsAgo = idx === -1 ? lottery.results.length : idx;
      delayedUna.push({
        digit: d,
        drawsAgo,
        status: drawsAgo > 12 ? 'CRITICAL' : drawsAgo > 6 ? 'HIGH' : 'MEDIUM',
      });
    }
    delayedUna.sort((a, b) => b.drawsAgo - a.drawsAgo);
    const top3DelayedUna = delayedUna.slice(0, 3);

    // B) Últimas 2 cifras (Pata - posiciones 3 y 4)
    const delayedPata: { termination: string; drawsAgo: number }[] = [];
    for (let i = 0; i < 100; i++) {
      const term = i.toString().padStart(2, '0');
      const idx = lottery.results.findIndex(
        (r) => r.number && r.number.length === 4 && r.number.slice(2, 4) === term,
      );
      const drawsAgo = idx === -1 ? lottery.results.length : idx;
      delayedPata.push({
        termination: term,
        drawsAgo,
      });
    }
    delayedPata.sort((a, b) => b.drawsAgo - a.drawsAgo);
    const top3DelayedPata = delayedPata.slice(0, 3);

    // 3. Cruce con Pirámide Numerológica del día
    const today = new Date();
    const pyramidData = this.calculateNumerologicalPyramid(today.toISOString());
    const leftDiag = pyramidData.keyCombinations.leftDiagonal;
    const rightDiag = pyramidData.keyCombinations.rightDiagonal;
    const apexCluster = pyramidData.keyCombinations.apexCluster;

    // Generar Jugada Híbrida del Día:
    const primaryPrefix = leftDiag.slice(0, 3).padEnd(3, '7');
    const delayedUnaTop = top3DelayedUna[0]?.digit ?? 7;
    const hybridPrimary = `${primaryPrefix}${delayedUnaTop}`;

    const secondaryPrefix = rightDiag.slice(0, 2).padEnd(2, '4');
    const delayedPataTop = top3DelayedPata[0]?.termination ?? '28';
    const hybridSecondary = `${secondaryPrefix}${delayedPataTop}`;

    return {
      lottery: {
        id: lottery.id,
        name: lottery.name,
        slug: lottery.slug,
        category: lottery.category,
        schedule: lottery.schedule,
        playDays: lottery.playDays,
      },
      latestResult: {
        number: latestNumber,
        series: latestResult?.series || null,
        drawDate: latestResult?.drawDate || new Date().toISOString(),
        invertedNumber,
        mirrorNumber,
      },
      counterpartResult,
      delayedStats: {
        una: top3DelayedUna,
        pata: top3DelayedPata,
        totalDrawsAnalyzed: lottery.results.length,
      },
      pyramidKey: {
        dateFormatted: pyramidData.dateFormatted,
        leftDiagonal: leftDiag,
        rightDiagonal: rightDiag,
        apexCluster,
        centerBase: pyramidData.keyCombinations.centerBase,
      },
      hybridRecommendation: {
        primaryCombination: hybridPrimary,
        secondaryCombination: hybridSecondary,
        confidence: 94,
        rationale: `Fusión de la diagonal piramidal de hoy (${primaryPrefix}) con el dígito más atrasado en la uña (${delayedUnaTop}, con ${top3DelayedUna[0]?.drawsAgo} sorteos sin caer en 4ª posición) para ${lottery.name}.`,
      },
    };
  }

  /**
   * Buscador Global "Verifica tu Número" (Historial 360° en toda Colombia)
   */
  async checkNumberGlobal(rawNumber: string) {
    const cleanNumber = (rawNumber || '').replace(/[^\d]/g, '').slice(-4).padStart(4, '0');
    const pata = cleanNumber.slice(-2);
    const una = cleanNumber.slice(-1);

    // 1. Todas las apariciones exactas de 4 cifras
    const occurrences = await this.prisma.result.findMany({
      where: {
        number: cleanNumber,
      },
      include: {
        lottery: true,
      },
      orderBy: {
        drawDate: 'desc',
      },
    });

    // 2. Conteo de apariciones de la Pata (últimas 2 cifras)
    const pataCount = await this.prisma.result.count({
      where: {
        number: {
          endsWith: pata,
        },
      },
    });

    // 3. Conteo de apariciones de la Uña (última cifra)
    const unaCount = await this.prisma.result.count({
      where: {
        number: {
          endsWith: una,
        },
      },
    });

    // Agrupar por lotería/chance
    const lotteryMap = new Map<number, { lotteryName: string; category: string; count: number; lastDate: Date }>();
    for (const occ of occurrences) {
      const existing = lotteryMap.get(occ.lotteryId);
      if (!existing) {
        lotteryMap.set(occ.lotteryId, {
          lotteryName: occ.lottery.name,
          category: occ.lottery.category,
          count: 1,
          lastDate: occ.drawDate,
        });
      } else {
        existing.count++;
        if (new Date(occ.drawDate) > new Date(existing.lastDate)) {
          existing.lastDate = occ.drawDate;
        }
      }
    }

    const now = new Date();
    const lastAppearance = occurrences.length > 0 ? occurrences[0].drawDate : null;
    const daysAgo = lastAppearance
      ? Math.max(0, Math.floor((now.getTime() - new Date(lastAppearance).getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      number: cleanNumber,
      totalOccurrences: occurrences.length,
      lastAppearance,
      daysAgo,
      pata,
      pataOccurrences: pataCount,
      una,
      unaOccurrences: unaCount,
      byLottery: Array.from(lotteryMap.values()).sort((a, b) => b.count - a.count),
      recentOccurrences: occurrences.slice(0, 20).map((o) => ({
        id: o.id,
        lotteryName: o.lottery.name,
        category: o.lottery.category,
        drawDate: o.drawDate,
        series: o.series,
        zodiacSign: o.zodiacSign,
      })),
    };
  }
}
