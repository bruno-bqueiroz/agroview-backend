// src/services/area.service.ts
import { AreaRepository } from '../repositories/area.repository'; // Ajuste o caminho se necessário
import { Area, Prisma } from '@prisma/client';

// Interface para os dados de atualização da área (mantida)
export interface AreaUpdateData { // Exportar a interface se o controller precisar dela
  name?: string;
  areaType?: string;
  geom?: any; 
}

export class AreaService {
  private repo = new AreaRepository();

  async createArea(data: {
    userId: number;
    name: string;
    areaType: string;
    geom?: any;
  }): Promise<Area> {
    const areaData: Prisma.AreaCreateInput = {
      name: data.name,
      areaType: data.areaType,
      geom: data.geom === undefined ? Prisma.JsonNull : data.geom, // Trata geom opcional explicitamente
      user: { connect: { id: data.userId } },
    };
    return this.repo.create(areaData);
  }

  async listAreas(userId: number): Promise<Area[]> {
    // Este método já está correto, pois busca áreas pelo userId.
    return this.repo.findByUser(userId);
  }

  // --- MÉTODOS MODIFICADOS PARA INCLUIR VERIFICAÇÃO DE userId ---

  async getAreaById(areaId: number, userId: number): Promise<Area | null> { // <<< userId adicionado como parâmetro
    const area = await this.repo.findById(areaId);
    if (!area) {
      const err = new Error('Área não encontrada.');
      (err as any).status = 404;
      throw err;
    }
    // Verifica se a área pertence ao usuário autenticado
    if (area.userId !== userId) {
      const err = new Error('Acesso não autorizado a esta área.');
      (err as any).status = 403; // Forbidden
      throw err;
    }
    return area;
  }

  async updateArea(areaId: number, userId: number, data: AreaUpdateData): Promise<Area> { // <<< userId adicionado
    const existingArea = await this.repo.findById(areaId);
    if (!existingArea) {
      const err = new Error('Área não encontrada para atualização.');
      (err as any).status = 404;
      throw err;
    }
    // Verifica se a área pertence ao usuário autenticado
    if (existingArea.userId !== userId) {
      const err = new Error('Acesso não autorizado para atualizar esta área.');
      (err as any).status = 403; // Forbidden
      throw err;
    }

    const updatePayload: Prisma.AreaUpdateInput = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.areaType !== undefined) updatePayload.areaType = data.areaType;
    // Trata geom: se for explicitamente null no payload, passa JsonNull, senão o valor.
    // Se geom não estiver no payload 'data', não será alterado.
    if (data.hasOwnProperty('geom')) { // Verifica se geom foi intencionalmente enviado
        updatePayload.geom = data.geom === null ? Prisma.JsonNull : data.geom;
    }
    
    if (Object.keys(updatePayload).length === 0) {
        const err = new Error('Nenhum dado válido fornecido para atualização.');
        (err as any).status = 400;
        throw err;
    }

    return this.repo.update(areaId, updatePayload);
  }

  async deleteArea(areaId: number, userId: number): Promise<Area> { // <<< userId adicionado
    const existingArea = await this.repo.findById(areaId);
    if (!existingArea) {
      const err = new Error('Área não encontrada para exclusão.');
      (err as any).status = 404;
      throw err;
    }
    // Verifica se a área pertence ao usuário autenticado
    if (existingArea.userId !== userId) {
      const err = new Error('Acesso não autorizado para deletar esta área.');
      (err as any).status = 403; // Forbidden
      throw err;
    }
    // Considere o que acontece com os sensores desta área.
    // O Prisma pode ter regras onDelete (cascade, restrict, etc.) definidas no schema.
    // Se não, você pode precisar deletar/desassociar sensores manualmente aqui antes de deletar a área.
    return this.repo.delete(areaId);
  }
  // --- FIM DOS MÉTODOS MODIFICADOS ---
}