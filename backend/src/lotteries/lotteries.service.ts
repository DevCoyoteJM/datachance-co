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
}
