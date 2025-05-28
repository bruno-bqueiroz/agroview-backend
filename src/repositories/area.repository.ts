import { prisma } from '../prismaClient';
import type { Area, Prisma } from '@prisma/client';

export class AreaRepository {
  async create(data: Prisma.AreaCreateInput): Promise<Area> {
    return prisma.area.create({ data });
  }

  async findByUser(userId: number): Promise<Area[]> {
    return prisma.area.findMany({ where: { userId } });
  }

  async findById(id: number): Promise<Area | null> {
    return prisma.area.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.AreaUpdateInput): Promise<Area> {
    return prisma.area.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Area> {
    return prisma.area.delete({ where: { id } });
  }
}
