// src/services/sensor.service.ts
import { SensorRepository } from '../repositories/sensor.repository'; // Ajuste o caminho
import type { Sensor, Prisma } from '@prisma/client';

// Interface para dados de criação, incluindo userId
interface CreateSensorData {
  areaId: number;
  userId: number; // <<< Adicionado userId
  name: string;
  type: string;
  model?: string;
  active?: boolean; // Permitir definir no momento da criação
  installedAt?: Date; // Permitir definir no momento da criação
}

interface SensorUpdateData {
  name?: string;
  type?: string;
  model?: string | null; // Permitir null para limpar o modelo se ele for opcional
  active?: boolean;
  installedAt?: string | Date; // Pode vir como string do form ou Date
  areaId?: number; // Permitir mudar a área do sensor
}

export class SensorService {
  private repo = new SensorRepository();

  async createSensor(data: CreateSensorData): Promise<Sensor> {
    const sensorDataToCreate: Prisma.SensorCreateInput = {
      name: data.name,
      type: data.type,
      model: data.model,
      installedAt: data.installedAt || new Date(), // Usa data fornecida ou default
      active: data.active === undefined ? true : data.active, // Default true se não fornecido
      area: { connect: { id: data.areaId } },
      user: { connect: { id: data.userId } }, // <<< Conectar ao usuário
    };
    return this.repo.create(sensorDataToCreate);
  }

  // Modificado para listar por userId
  async listSensorsByUserId(userId: number): Promise<Sensor[]> {
    return this.repo.findByUserId(userId);
  }

  // Mantenha listSensors por areaId se ainda for necessário
  async listSensorsByAreaId(areaId: number): Promise<Sensor[]> {
    return this.repo.findByArea(areaId);
  }

  // Métodos para findById, update, delete (serão adicionados quando implementarmos o CRUD completo de sensores)
  async getSensorById(id: number): Promise<Sensor | null> {
    return this.repo.findById(id);
  }

  // --- NOVO MÉTODO updateSensor ---
  async updateSensor(sensorId: number, data: SensorUpdateData): Promise<Sensor> {
    // Primeiro, verifique se o sensor existe
    const existingSensor = await this.repo.findById(sensorId);
    if (!existingSensor) {
      const err = new Error('Sensor não encontrado para atualização.');
      (err as any).status = 404;
      throw err;
    }

    // Construir o payload de atualização para o Prisma
    const updatePayload: Prisma.SensorUpdateInput = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.model !== undefined) updatePayload.model = data.model; // Permite definir como null
    if (data.active !== undefined) updatePayload.active = data.active;
    if (data.installedAt !== undefined) {
        updatePayload.installedAt = (typeof data.installedAt === 'string') ? new Date(data.installedAt) : data.installedAt;
    }
    if (data.areaId !== undefined) {
      updatePayload.area = { connect: { id: data.areaId } };
    }
    // O userId de um sensor geralmente não é alterado após a criação,
    // mas se precisar, a lógica seria similar à de areaId.

    if (Object.keys(updatePayload).length === 0) {
        const err = new Error('Nenhum dado válido fornecido para atualização.');
        (err as any).status = 400; // Bad Request
        throw err;
    }

    return this.repo.update(sensorId, updatePayload);
  }

  async deleteSensor(sensorId: number): Promise<Sensor | null> { // Retorna o sensor deletado ou null
    // Adicionar verificações aqui se necessário:
    // - O sensor existe? (this.repo.findById(sensorId))
    // - O usuário logado tem permissão para deletar este sensor? (Quando tiver auth)

    // Verifica se o sensor existe antes de tentar deletar para dar um 404 mais claro
    const existingSensor = await this.repo.findById(sensorId);
    if (!existingSensor) {
      const err = new Error('Sensor não encontrado para exclusão.');
      (err as any).status = 404;
      throw err;
    }
    return this.repo.delete(sensorId);
  }
}