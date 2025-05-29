// src/services/area.service.ts
import { AreaRepository } from '../repositories/area.repository'; // Ajuste o caminho se necessário
import type { Area, Prisma } from '@prisma/client';

// Interface para os dados de atualização da área (apenas campos permitidos)
interface AreaUpdateData {
  name?: string;
  areaType?: string;
  geom?: any; // Prisma.JsonValue ou um tipo mais específico se você tiver
}

export class AreaService {
  private repo = new AreaRepository();

  async createArea(data: {
    userId: number;
    name: string;
    areaType: string;
    geom?: any; // Prisma.JsonValue
  }): Promise<Area> {
    // Sua lógica existente para criar a relação com o usuário está correta
    const areaData: Prisma.AreaCreateInput = {
      name: data.name,
      areaType: data.areaType,
      geom: data.geom,
      user: { connect: { id: data.userId } },
    };
    return this.repo.create(areaData);
  }

  async listAreas(userId: number): Promise<Area[]> {
    return this.repo.findByUser(userId);
  }

  // --- NOVOS MÉTODOS ---

  async getAreaById(areaId: number): Promise<Area | null> {
    const area = await this.repo.findById(areaId);
    if (!area) {
      // Em um cenário real com autenticação, você também verificaria se esta área
      // pertence ao usuário logado antes de retornar ou lançar erro.
      // Por agora, simplificamos.
      const err = new Error('Área não encontrada.');
      (err as any).status = 404;
      throw err;
    }
    return area;
  }

  async updateArea(areaId: number, data: AreaUpdateData): Promise<Area> {
    // Primeiro, verifique se a área existe (opcional, o Prisma pode falhar se não existir)
    // Em um cenário real, verificaríamos também a permissão do usuário para atualizar esta área.
    const existingArea = await this.repo.findById(areaId);
    if (!existingArea) {
      const err = new Error('Área não encontrada para atualização.');
      (err as any).status = 404;
      throw err;
    }

    // O Prisma.AreaUpdateInput já é bem tipado, mas AreaUpdateData ajuda a controlar o que vem do req.body
    const updatePayload: Prisma.AreaUpdateInput = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.areaType !== undefined) updatePayload.areaType = data.areaType;
    if (data.geom !== undefined) updatePayload.geom = data.geom;
    // Não permitimos alterar o userId por aqui diretamente, isso seria uma operação mais complexa.
    
    return this.repo.update(areaId, updatePayload);
  }

  async deleteArea(areaId: number): Promise<Area> {
    // Em um cenário real, verificaríamos também a permissão do usuário para deletar esta área.
    // E também o que fazer com os sensores associados (ex: deletar em cascata, desassociar).
    // Seu schema do Prisma pode ter regras para isso (onDelete).

    // Verifica se a área existe antes de tentar deletar (opcional, mas bom para retornar 404 claro)
    const existingArea = await this.repo.findById(areaId);
    if (!existingArea) {
      const err = new Error('Área não encontrada para exclusão.');
      (err as any).status = 404;
      throw err;
    }
    return this.repo.delete(areaId);
  }
  // --- FIM DOS NOVOS MÉTODOS ---
}