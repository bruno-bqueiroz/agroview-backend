// src/routes/sensor.routes.ts
import { Router } from 'express';
import { 
  createSensorController, 
  listSensorsByUserController, // Nome do controller atualizado/novo
  listSensorsByAreaController,  // Controller para a rota antiga, se mantida
  deleteSensorController,
  getSensorByIdController,
  updateSensorController,
  listSensorReadingsController,
  createSensorReadingController
  // Importar outros controllers quando forem criados (getById, update, delete)
} from '../controllers/sensor.controller'; // Ajuste o caminho

const sensorRouter = Router();

// Criar novo sensor (POST /sensors)
// O frontend precisará enviar userId e areaId no corpo
sensorRouter.post('/', createSensorController);

// Listar sensores de um usuário específico (GET /sensors?userId=X)
sensorRouter.get('/', listSensorsByUserController);

// Rota original para listar sensores por área (se você quiser mantê-la)
// GET /sensors/area/:areaId
sensorRouter.get('/area/:areaId', listSensorsByAreaController);

sensorRouter.get('/:sensorId', getSensorByIdController);
sensorRouter.put('/:sensorId', updateSensorController);

sensorRouter.delete('/:sensorId', deleteSensorController);

sensorRouter.get('/:sensorId/data', listSensorReadingsController);

sensorRouter.post('/:sensorId/data', createSensorReadingController);

// Adicionar rotas para GET /:id, PUT /:id, DELETE /:id quando implementarmos o CRUD completo

export default sensorRouter;