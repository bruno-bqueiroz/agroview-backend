// src/repositories/sensordata.repository.ts
import {prisma} from '../prismaClient'; // Ajuste o caminho se necessário
import type { SensorData } from '@prisma/client';

export class SensorDataRepository {
  async create(data: { 
    sensorId: number; 
    value: number; 
    timestamp?: Date 
  }): Promise<SensorData> {
    return prisma.sensorData.create({
      data: {
        sensorId: data.sensorId,
        value: data.value,
        timestamp: data.timestamp || new Date(),
      },
    });
  }

  async findBySensorId(
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

  // Método específico para a tendência de temperatura do dashboard
  async findRecentTemperatureReadingsForUser(
    userId: number,
    limit: number = 30 // Pega as últimas 30 leituras de temperatura
  ): Promise<SensorData[]> {
    return prisma.sensorData.findMany({
      where: {
        sensor: { // Filtra baseado nas propriedades do sensor relacionado
          userId: userId,
          type: {
            // Ajuste 'Temperatura' se o seu tipo for diferente
            contains: 'Temperatura', 
            mode: 'insensitive', 
          },
        },
      },
      orderBy: {
        timestamp: 'asc', // Para o gráfico, geralmente do mais antigo para o mais novo
      },
      take: limit,
      // include: { // Opcional, se precisar de dados do sensor junto com a leitura
      //   sensor: {
      //     select: { name: true, type: true }
      //   }
      // }
    });
  }

  // Adicione outros métodos conforme necessário (ex: findById, update, delete para SensorData)
}