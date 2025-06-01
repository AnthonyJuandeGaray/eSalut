import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import router from './routes/index';
import documentoRoutes from './routes/documento.routes';
import medicamentoRoutes from './routes/medicamento.routes'; // ✅ AÑADIDO

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Todas las rutas están bajo /api
app.use('/api/documentos', documentoRoutes);
app.use('/api/medicamentos', medicamentoRoutes); // ✅ AÑADIDO
app.use('/api', router);

// Ruta base
app.get('/', (req, res) => {
  res.send('API eSalut funcionando correctamente');
});

export default app;
