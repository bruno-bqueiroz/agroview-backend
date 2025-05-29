// src/routes/area.routes.ts
import { Router } from 'express';
import { 
  createAreaController, 
  listAreasController,
  getAreaByIdController,   // <<< Adicionar
  updateAreaController,   // <<< Adicionar
  deleteAreaController    // <<< Adicionar
} from '../controllers/area.controller'; // Ajuste o caminho se necessário

const areaRouter = Router();

// Criar nova área (POST /areas)
areaRouter.post('/', createAreaController);

// Listar áreas de um usuário específico (GET /areas/user/:userId)
// Esta rota pode ser mantida, ou você pode optar por listar todas as áreas
// e filtrar no frontend, ou ter uma rota GET /areas que o middleware de auth filtra pelo usuário logado.
// Por enquanto, vamos mantê-la.
areaRouter.get('/user/:userId', listAreasController);

// --- NOVAS ROTAS ---

// Buscar uma área específica por ID (GET /areas/:areaId)
areaRouter.get('/:areaId', getAreaByIdController);

// Atualizar uma área (PUT /areas/:areaId) - PUT geralmente espera o objeto completo
// Você pode usar PATCH se quiser permitir atualizações parciais de forma mais semântica
areaRouter.put('/:areaId', updateAreaController); 

// Deletar uma área (DELETE /areas/:areaId)
areaRouter.delete('/:areaId', deleteAreaController);

// --- FIM DAS NOVAS ROTAS ---

export default areaRouter;