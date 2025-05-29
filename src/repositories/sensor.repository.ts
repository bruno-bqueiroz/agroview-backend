import { prisma } from '../prismaClient';
// src/repositories/sensor.repository.ts
import type { Sensor, Prisma } from '@prisma/client';

export class SensorRepository {
  async create(data: Prisma.SensorCreateInput): Promise<Sensor> {
    return prisma.sensor.create({ data });
  }

  // Modificado para buscar por userId
  async findByUserId(userId: number): Promise<Sensor[]> {
    return prisma.sensor.findMany({
      where: { userId },
      include: { // Incluir o nome da área pode ser útil para o frontend
        area: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        installedAt: 'desc',
      },
    });
  }

  // Mantendo findByArea se você ainda precisar dela para outras coisas
  async findByArea(areaId: number): Promise<Sensor[]> {
    return prisma.sensor.findMany({ 
      where: { areaId },
      include: { area: { select: { name: true } } }, // Consistência
      orderBy: { installedAt: 'desc' }
    });
  }

  async findById(id: number): Promise<Sensor | null> {
    return prisma.sensor.findUnique({ 
      where: { id },
      include: { area: { select: { name: true } } }
    });
  }

  async update(id: number, data: Prisma.SensorUpdateInput): Promise<Sensor> {
    return prisma.sensor.update({ 
      where: { id }, 
      data,
      include: { area: { select: { name: true } } }
    });
  }

  async delete(id: number): Promise<Sensor> {
    return prisma.sensor.delete({ where: { id } });
  }
}