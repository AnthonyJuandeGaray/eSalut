import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllMedicosPublicos = async (_req: Request, res: Response) => {
  try {
    const medicos = await prisma.medico.findMany({
      select: {
        id: true,
        nombre: true,
        especialidad: {
          select: {
            nombre: true
          }
        },
        disponibilidad: {
          select: {
            id: true,
            dia: true,
            horaInicio: true,
            horaFin: true
          }
        }
      }
    });

    res.json(medicos);
  } catch (error) {
    console.error('Error al obtener médicos públicos:', error);
    res.status(500).json({ error: 'Error al obtener los médicos' });
  }
};

// Listar todos los médicos
export const listarMedicos = async (_req: Request, res: Response): Promise<Response | void> => {
  try {
    const medicos = await prisma.medico.findMany({
      select: {
        id: true,
        nombre: true,
        dni: true,
        email: true,
        especialidad: {
          select: { nombre: true }
        },
        especialidadId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json(medicos);
  } catch (error) {
    console.error('Error al listar médicos:', error);
    return res.status(500).json({ error: 'Error al listar médicos' });
  }
};

// Obtener un médico por ID
export const obtenerMedicoPorId = async (req: Request, res: Response): Promise<Response | void> => {
  const id = parseInt(req.params.id);

  try {
    const medico = await prisma.medico.findUnique({
      where: { id },
      include: {
        especialidad: true
      }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    return res.json(medico);
  } catch (error) {
    console.error('Error al obtener el médico:', error);
    return res.status(500).json({ error: 'Error al obtener el médico' });
  }
};

// Actualizar solo la especialidad de un médico
export const actualizarEspecialidad = async (req: Request, res: Response): Promise<Response | void> => {
  const id = parseInt(req.params.id);
  const { especialidadId } = req.body;

  if (!especialidadId) {
    return res.status(400).json({ error: 'El campo especialidadId es obligatorio' });
  }

  try {
    const medicoActualizado = await prisma.medico.update({
      where: { id },
      data: { especialidadId: Number(especialidadId) }
    });

    return res.json({
      mensaje: 'Especialidad actualizada correctamente',
      medico: {
        id: medicoActualizado.id,
        especialidadId: medicoActualizado.especialidadId
      }
    });
  } catch (error) {
    console.error('Error al actualizar especialidad:', error);
    return res.status(500).json({ error: 'Error al actualizar especialidad' });
  }
};

// Eliminar médico
export const eliminarMedico = async (req: Request, res: Response): Promise<Response | void> => {
  const id = parseInt(req.params.id);

  try {
    await prisma.medico.delete({
      where: { id }
    });

    return res.json({ mensaje: 'Médico eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar médico:', error);
    return res.status(500).json({ error: 'Error al eliminar médico' });
  }
};
