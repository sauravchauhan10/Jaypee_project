import { prisma } from '@prescribeflow/db';
import type { Prisma } from '@prescribeflow/db';

import { ApiError } from '../lib/apiError.js';
import type {
  MedicineQueryInput,
  InteractionCheckInput,
} from './medicine.schema.js';

// ── Search & List ─────────────────────────────────────────────
export const search = async (query: MedicineQueryInput) => {
  const { page, limit, search, category } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.MedicineWhereInput = {
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { genericName: { contains: search, mode: 'insensitive' } },
      { brandNames: { hasSome: [search] } },
    ];
  }

  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  const [data, total] = await Promise.all([
    prisma.medicine.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.medicine.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Find By Id ────────────────────────────────────────────────
export const findById = async (id: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id, deletedAt: null },
  });

  if (!medicine) {
    throw ApiError.notFound('Medicine not found in catalog');
  }

  return medicine;
};

// ── Check Interactions ────────────────────────────────────────
export const checkInteractions = async (input: InteractionCheckInput) => {
  // In a real production system, this would call out to an external drug API
  // e.g. First Databank, Lexicomp, or RxNorm.
  // Here we do a basic check against our internal database's `commonInteractions` array.

  const medicines = await prisma.medicine.findMany({
    where: { id: { in: input.medicineIds }, deletedAt: null },
    select: { id: true, name: true, commonInteractions: true },
  });

  if (medicines.length !== input.medicineIds.length) {
    throw ApiError.badRequest('One or more medicines not found');
  }

  const interactions: Array<{
    drugs: [string, string];
    severity: 'MODERATE' | 'SEVERE';
    description: string;
  }> = [];

  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      const medA = medicines[i]!;
      const medB = medicines[j]!;

      // Extremely simple naive match: if MedA's name is in MedB's common interactions list, etc.
      // Usually, `commonInteractions` would hold generic names or drug classes.
      const interactAtoB = medA.commonInteractions.some(ci => medB.name.toLowerCase().includes(ci.toLowerCase()));
      const interactBtoA = medB.commonInteractions.some(ci => medA.name.toLowerCase().includes(ci.toLowerCase()));

      if (interactAtoB || interactBtoA) {
        interactions.push({
          drugs: [medA.name, medB.name],
          severity: 'MODERATE',
          description: `Potential interaction between ${medA.name} and ${medB.name}. Check clinical references for details.`,
        });
      }
    }
  }

  return {
    hasInteractions: interactions.length > 0,
    interactions,
  };
};
