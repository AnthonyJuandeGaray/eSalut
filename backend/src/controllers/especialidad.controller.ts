import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { especialidadSchema } from '../validations/schemas'; // ✅ Zod

// Crear una especialidad
export const crearEspecialidad = async (req: Request, res: Response): Promise<Response | void> => {
  const parsed = especialidadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { nombre } = parsed.data;

  try {
    const existe = await prisma.especialidad.findUnique({ where: { nombre } });

    if (existe) {
      return res.status(400).json({ error: 'La especialidad ya existe' });
    }

    const especialidad = await prisma.especialidad.create({
      data: { nombre }
    });

    return res.status(201).json(especialidad);
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear la especialidad' });
  }
};

// Listar todas las especialidades
export const listarEspecialidades = async (_req: Request, res: Response): Promise<Response | void> => {
  try {
    const especialidades = await prisma.especialidad.findMany({
      include: { medicos: true }
    });

    return res.json(especialidades);
  } catch (error) {
    return res.status(500).json({ error: 'Error al listar especialidades' });
  }
};

// Obtener especialidad por ID
export const obtenerEspecialidadPorId = async (req: Request, res: Response): Promise<Response | void> => {
  const id = parseInt(req.params.id);

  try {
    const especialidad = await prisma.especialidad.findUnique({
      where: { id },
      include: { medicos: true }
    });

    if (!especialidad) {
      return res.status(404).json({ error: 'Especialidad no encontrada' });
    }

    return res.json(especialidad);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener la especialidad' });
  }
};

// Modificar especialidad
export const actualizarEspecialidad = async (req: Request, res: Response): Promise<Response | void> => {
  const id = parseInt(req.params.id);

  const parsed = especialidadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { nombre } = parsed.data;

  try {
    const especialidad = await prisma.especialidad.update({
      where: { id },
      data: { nombre }
    });

    return res.json(especialidad);
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar la especialidad' });
  }
};

// Eliminar especialidad (solo si no tiene médicos vinculados)
export const eliminarEspecialidad = async (req: Request, res: Response): Promise<Response | void> => {
  const id = parseInt(req.params.id);

  try {
    const especialidad = await prisma.especialidad.findUnique({
      where: { id },
      include: { medicos: true }
    });

    if (!especialidad) {
      return res.status(404).json({ error: 'Especialidad no encontrada' });
    }

    if (especialidad.medicos.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar una especialidad con médicos vinculados' });
    }

    await prisma.especialidad.delete({ where: { id } });

    return res.json({ mensaje: 'Especialidad eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar la especialidad' });
  }
};
