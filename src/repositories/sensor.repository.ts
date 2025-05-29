import { prisma } from '../prismaClient';
// src/repositories/sensor.repository.ts
import type { Sensor, Prisma, SensorData } from '@prisma/client';

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

    // --- MÉTODOS PARA SensorData ---
  async createSensorReading(data: Prisma.SensorDataUncheckedCreateInput): Promise<SensorData> {
    // Prisma.SensorDataUncheckedCreateInput permite passar sensorId diretamente
    return prisma.sensorData.create({
      data: {
        sensorId: data.sensorId,
        value: data.value,
        timestamp: data.timestamp || new Date(), // Default para agora se não fornecido
      },
    });
  }

  async findSensorReadings(
    sensorId: number,
    limit: number = 50,
    orderBy: 'asc' | 'desc' = 'desc'
  ): Promise<SensorData[]> {
    return prisma.sensorData.findMany({
      where: { sensorId },
      orderBy: {
        timestamp: orderBy,
      },
      take: limit,
    });
  }

}

