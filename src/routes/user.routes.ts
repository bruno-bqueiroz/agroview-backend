// src/routes/user.routes.ts
import { Router } from 'express';
// Adicionar loginController à importação
import { registerController, getUserController, loginController, getDashboardStatsController, getTemperatureTrendController } from '../controllers/user.controller';

const router = Router();

// Rota de Registro (POST /users/)
router.post('/', registerController); // Seu original: POST /users -> cria usuário

// Rota de Login (POST /users/login)
router.post('/login', loginController); // <<< NOVA ROTA

// Rota para Buscar Usuário por ID (GET /users/:id)
router.get('/:id', getUserController);

router.get('/:userId/dashboard/temperature-trend', getTemperatureTrendController); // GET /users/:userId/dashboard/temperature-trend


router.get('/:userId/dashboard-stats', getDashboardStatsController);


export default router;