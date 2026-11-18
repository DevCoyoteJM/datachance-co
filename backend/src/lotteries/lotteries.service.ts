import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LotteriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string, schedule?: string) {
    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (schedule && schedule !== 'ALL') {
      where.schedule = schedule;
    }

    return this.prisma.lottery.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        results: {
          take: 1,
          orderBy: { drawDate: 'desc' },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const lottery = await this.prisma.lottery.findUnique({
      where: { slug },
      include: {
        results: {
          take: 30,
          orderBy: { drawDate: 'desc' },
        },
      },
    });

    if (!lottery) {
      throw new NotFoundException(`Lottery with slug ${slug} not found`);
    }

    return lottery;
  }

  async findResults(params: {
    lotteryId?: number;
    category?: string;
    schedule?: string;
    limit?: number;
    date?: string;
  }) {
    const { lotteryId, category, schedule, limit = 50, date } = params;

    const where: any = {};

    if (lotteryId) {
      where.lotteryId = Number(lotteryId);
    }

    if (category && category !== 'ALL') {
      where.lottery = { ...where.lottery, category };
    }

    if (schedule && schedule !== 'ALL') {
      where.lottery = { ...where.lottery, schedule };
    }

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      where.drawDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.result.findMany({
      where,
      take: Number(limit),
      orderBy: { drawDate: 'desc' },
      include: {
        lottery: true,
      },
    });
  }

  async getLatestResultsGrouped() {
    const lotteries = await this.prisma.lottery.findMany({
      include: {
        results: {
          take: 1,
          orderBy: { drawDate: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return lotteries.map((l) => ({
      lottery: {
        id: l.id,
        name: l.name,
        slug: l.slug,
        category: l.category,
        schedule: l.schedule,
        playDays: l.playDays,
        hasSeries: l.hasSeries,
        hasZodiac: l.hasZodiac,
        isBaloto: l.isBaloto,
      },
      latestResult: l.results[0] || null,
    }));
  }

  /**
   * Historial de Sorteos Anteriores con paginación, filtros de fecha y búsqueda por cifra/terminación
   */
  async getLotteryHistory(
    slug: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const lottery = await this.prisma.lottery.findUnique({
      where: { slug },
    });

    if (!lottery) {
      throw new NotFoundException(`Lotería con slug '${slug}' no encontrada`);
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      lotteryId: lottery.id,
    };

    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      if (lottery.isBaloto) {
        where.OR = [
          { balotas: { contains: term } },
          { superbalota: { contains: term } },
        ];
      } else {
        where.OR = [
          { number: { contains: term } },
          { series: { contains: term } },
          { zodiacSign: { contains: term } },
        ];
      }
    }

    if (params.startDate || params.endDate) {
      where.drawDate = {};
      if (params.startDate) {
        where.drawDate.gte = new Date(`${params.startDate}T00:00:00.000Z`);
      }
      if (params.endDate) {
        where.drawDate.lte = new Date(`${params.endDate}T23:59:59.999Z`);
      }
    }

    const [total, results] = await Promise.all([
      this.prisma.result.count({ where }),
      this.prisma.result.findMany({
        where,
        skip,
        take: limit,
        orderBy: { drawDate: 'desc' },
      }),
    ]);

    const now = new Date();
    const formattedResults = results.map((r) => {
      const diffMs = now.getTime() - new Date(r.drawDate).getTime();
      const daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      return {
        ...r,
        daysAgo,
      };
    });

    return {
      lottery,
      results: formattedResults,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
