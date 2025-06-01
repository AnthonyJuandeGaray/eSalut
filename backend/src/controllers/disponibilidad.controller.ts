import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

// Validación de entrada
const disponibilidadSchema = z.object({
  dia: z.enum([
    'LUNES', 'MARTES', 'MIERCOLES',
    'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'
  ]),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:mm inválido'),
  horaFin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:mm inválido')
});

// Obtener disponibilidad del médico autenticado
export const obtenerDisponibilidad = async (req: Request, res: Response) => {
  // @ts-ignore
  const medicoId = req.user?.id;
  if (!medicoId) return res.status(401).json({ error: 'Token inválido' });

  try {
    const franjas = await prisma.disponibilidad.findMany({
      where: { medicoId },
      orderBy: [{ dia: 'asc' }, { horaInicio: 'asc' }]
    });

    return res.json(franjas);
  } catch (error) {
    console.error('Error al obtener la disponibilidad:', error);
    return res.status(500).json({ error: 'Error al obtener la disponibilidad' });
  }
};

// Crear nueva franja de disponibilidad
export const crearDisponibilidad = async (req: Request, res: Response) => {
  console.log("REQ.BODY:", req.body);
  // @ts-ignore
  console.log("USUARIO:", req.user);

  const parsed = disponibilidadSchema.safeParse(req.body);
  if (!parsed.success) {
    console.log("ZOD ERROR:", parsed.error.format());
    return res.status(400).json({ error: parsed.error.format() });
  }

  // @ts-ignore
  const medicoId = req.user?.id;
  if (!medicoId) return res.status(401).json({ error: 'Token inválido o usuario no autenticado' });

  const { dia, horaInicio, horaFin } = parsed.data;

  try {
    const nuevaFranja = await prisma.disponibilidad.create({
      data: {
        dia,
        horaInicio,
        horaFin,
        medicoId
      }
    });
    return res.status(201).json(nuevaFranja);
  } catch (error) {
    console.error("ERROR EN PRISMA:", error);
    return res.status(500).json({ error: 'Error al crear franja de disponibilidad' });
  }
};

// Eliminar franja de disponibilidad por ID
export const eliminarDisponibilidad = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    await prisma.disponibilidad.delete({
      where: { id }
    });
    return res.status(204).send();
  } catch (error) {
    console.error("ERROR AL ELIMINAR:", error);
    return res.status(500).json({ error: 'Error al eliminar franja' });
  }
};
