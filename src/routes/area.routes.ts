// src/routes/area.routes.ts
import { Router } from 'express';
import { 
  createAreaController, 
  listAreasController,
  getAreaByIdController,   // <<< Adicionar
  updateAreaController,   // <<< Adicionar
  deleteAreaController    // <<< Adicionar
} from '../controllers/area.controller'; // Ajuste o caminho se necessário
import { authMiddleware } from '../middlewares/auth.middleware';

const areaRouter = Router();

areaRouter.use(authMiddleware); // <<< TODAS AS ROTAS ABAIXO ESTARÃO PROTEGIDAS


areaRouter.post('/', createAreaController);

areaRouter.get('/', listAreasController);

areaRouter.get('/:areaId', getAreaByIdController);

areaRouter.put('/:areaId', updateAreaController); 

areaRouter.delete('/:areaId', deleteAreaController);

export default areaRouter;