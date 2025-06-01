import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const crearNotificacionSchema = z.object({
  mensaje: z.string().min(1, 'El mensaje es obligatorio'),
  usuarioId: z.number({ required_error: 'usuarioId es obligatorio' })
});

// Crear una notificación
export const crearNotificacion = async (req: Request, res: Response): Promise<Response | void> => {
  const parsed = crearNotificacionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { mensaje, usuarioId } = parsed.data;

  try {
    const notificacion = await prisma.notificacion.create({
      data: {
        mensaje,
        usuarioId
      }
    });

    return res.status(201).json({ mensaje: 'Notificación creada', notificacion });
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear la notificación' });
  }
};

// Obtener notificaciones de un usuario
export const obtenerNotificacionesPorUsuario = async (req: Request, res: Response): Promise<Response | void> => {
  const usuarioId = parseInt(req.params.id);

  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { fecha: 'desc' }
    });

    return res.json(notificaciones);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

// Marcar notificación como leída
export const marcarComoLeida = async (req: Request, res: Response): Promise<Response | void> => {
  const id = parseInt(req.params.id);

  try {
    const notificacion = await prisma.notificacion.update({
      where: { id },
      data: { leida: true }
    });

    return res.json({ mensaje: 'Notificación marcada como leída', notificacion });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar notificación' });
  }
};

// Eliminar notificación
export const eliminarNotificacion = async (req: Request, res: Response): Promise<Response | void> => {
  const id = parseInt(req.params.id);

  try {
    await prisma.notificacion.delete({ where: { id } });
    return res.json({ mensaje: 'Notificación eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar notificación' });
  }
};
