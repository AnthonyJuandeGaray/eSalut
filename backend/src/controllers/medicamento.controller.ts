import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Obtener todos los medicamentos
export const obtenerMedicamentos = async (_req: Request, res: Response) => {
  try {
    const medicamentos = await prisma.medicamento.findMany();
    return res.json(medicamentos);
  } catch (error) {
    console.error('❌ Error al obtener medicamentos:', error);
    return res.status(500).json({ error: 'Error al obtener medicamentos' });
  }
};

// Crear nuevo medicamento
export const crearMedicamento = async (req: Request, res: Response) => {
  const { nombre } = req.body;

  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ error: 'Nombre del medicamento requerido' });
  }

  try {
    const nuevo = await prisma.medicamento.create({ data: { nombre } });
    return res.status(201).json(nuevo);
  } catch (error) {
    console.error('❌ Error al crear medicamento:', error);
    return res.status(500).json({ error: 'Error al crear medicamento' });
  }
};

// Editar medicamento por ID
export const editarMedicamento = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { nombre } = req.body;

  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ error: 'Nombre del medicamento requerido' });
  }

  try {
    const actualizado = await prisma.medicamento.update({
      where: { id },
      data: { nombre }
    });
    return res.json(actualizado);
  } catch (error) {
    console.error('❌ Error al editar medicamento:', error);
    return res.status(500).json({ error: 'Error al editar medicamento' });
  }
};

// Eliminar medicamento por ID
export const eliminarMedicamento = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.medicamento.delete({ where: { id } });
    return res.json({ mensaje: 'Medicamento eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar medicamento:', error);
    return res.status(500).json({ error: 'Error al eliminar medicamento' });
  }
};
