import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
  crearCitaSchema,
  editarCitaSchema
} from '../validations/schemas';
import { CitaEstado } from '@prisma/client';

// Crear nueva cita
export const crearCita = async (req: Request, res: Response) => {
  const parsed = crearCitaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const {
    medicoId,
    fecha,
    motivoConsulta,
    tipo,
    observaciones,
    presencial
  } = parsed.data;

  // @ts-ignore
  const usuarioId = req.user?.id;
  if (!usuarioId) return res.status(401).json({ error: 'Token inválido' });

  try {
    const cita = await prisma.cita.create({
      data: {
        medicoId,
        usuarioId,
        fecha: new Date(fecha),
        motivoConsulta,
        tipo,
        observaciones,
        presencial,
        ubicacion: presencial ? null : undefined
      }
    });
    return res.status(201).json(cita);
  } catch (error) {
    console.error('❌ Error al crear cita:', error);
    return res.status(500).json({ error: 'Error al crear la cita' });
  }
};

// Obtener citas del usuario autenticado
export const obtenerCitasPorUsuario = async (req: Request, res: Response) => {
  // @ts-ignore
  const usuarioId = req.user?.id;
  if (!usuarioId) return res.status(401).json({ error: 'Token inválido' });

  try {
    const citas = await prisma.cita.findMany({
      where: { usuarioId },
      include: { medico: { select: { nombre: true } } },
      orderBy: { fecha: 'asc' }
    });
    return res.json(citas);
  } catch (error) {
    console.error('❌ Error al obtener citas del usuario:', error);
    return res.status(500).json({ error: 'Error al obtener las citas' });
  }
};

// Obtener citas del médico autenticado
export const obtenerCitasPorMedico = async (req: Request, res: Response) => {
  // @ts-ignore
  const medicoId = req.user?.id;
  if (!medicoId) return res.status(401).json({ error: 'Token inválido' });

  try {
    const citas = await prisma.cita.findMany({
      where: { medicoId },
      include: { usuario: { select: { nombre: true, email: true } } },
      orderBy: { fecha: 'asc' }
    });
    return res.json(citas);
  } catch (error) {
    console.error('❌ Error al obtener citas del médico:', error);
    return res.status(500).json({ error: 'Error al obtener las citas del médico' });
  }
};

// Editar cita completa
export const editarCita = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const parsed = editarCitaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { fecha, medicoId, tipo, observaciones, estado, motivoConsulta, presencial } = parsed.data;

  try {
    const cita = await prisma.cita.update({
      where: { id },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        medicoId,
        tipo,
        observaciones,
        estado,
        motivoConsulta,
        presencial
      }
    });
    return res.json(cita);
  } catch (error) {
    console.error('❌ Error al editar cita:', error);
    return res.status(500).json({ error: 'Error al editar la cita' });
  }
};

// ✅ Actualizar solo el estado de una cita
export const actualizarEstadoCita = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'Falta el campo estado' });
  }

  if (!Object.values(CitaEstado).includes(estado)) {
    return res.status(400).json({ error: `Estado inválido: ${estado}` });
  }

  try {
    const cita = await prisma.cita.update({
      where: { id },
      data: { estado }
    });

    console.log('✅ Estado actualizado:', cita.estado);
    return res.json(cita);
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    return res.status(500).json({ error: 'Error al actualizar el estado de la cita' });
  }
};
// Obtener todas las citas (solo admin)
export const obtenerTodasLasCitas = async (_req: Request, res: Response) => {
  try {
    const citas = await prisma.cita.findMany({
      include: {
        usuario: { select: { nombre: true } },
        medico: { select: { nombre: true } }
      },
      orderBy: { fecha: 'asc' }
    });
    return res.json(citas);
  } catch (error) {
    console.error('❌ Error al obtener todas las citas:', error);
    return res.status(500).json({ error: 'Error al obtener todas las citas' });
  }
};
// ✅ NUEVO: Aceptar cita con nueva hora (modificando el campo fecha)
export const aceptarCitaConHora = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { hora } = req.body;

  if (!hora) {
    return res.status(400).json({ error: 'La hora es requerida' });
  }

  try {
    const citaExistente = await prisma.cita.findUnique({ where: { id } });

    if (!citaExistente) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const nuevaFecha = new Date(citaExistente.fecha);
    const [h, m] = hora.split(':').map(Number);
    nuevaFecha.setHours(h);
    nuevaFecha.setMinutes(m);
    nuevaFecha.setSeconds(0);
    nuevaFecha.setMilliseconds(0);

    const cita = await prisma.cita.update({
      where: { id },
      data: {
        estado: 'ACEPTADA',
        fecha: nuevaFecha,
      }
    });

    console.log('✅ Cita aceptada con nueva hora:', cita.fecha);
    return res.json(cita);
  } catch (error) {
    console.error('❌ Error al aceptar cita con hora:', error);
    return res.status(500).json({ error: 'Error al aceptar la cita' });
  }
};
