import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

// Validación
const editarUsuarioSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email no válido'),
  rol: z.enum(['PACIENTE', 'MEDICO', 'ADMIN']),
});

export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        dni: true,
        email: true,
        verificado: true,
        rol: true
      }
    });
    return res.json(usuarios);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const verificarUsuario = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const actualizado = await prisma.usuario.update({
      where: { id },
      data: { verificado: true }
    });
    return res.json({
      mensaje: 'Usuario verificado',
      usuario: actualizado
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar usuario' });
  }
};

export const eliminarUsuario = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Si es médico, eliminar también de la tabla medico
    if (usuario.rol === 'MEDICO') {
      await prisma.medico.deleteMany({ where: { dni: usuario.dni } });
    }

    await prisma.usuario.delete({ where: { id } });
    return res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

export const editarUsuario = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const parsed = editarUsuarioSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { nombre, email, rol } = parsed.data;

  try {
    const actualizado = await prisma.usuario.update({
      where: { id },
      data: { nombre, email, rol },
    });

    const medicoExistente = await prisma.medico.findFirst({
      where: { dni: actualizado.dni }
    });

    if (rol === 'MEDICO') {
      if (!medicoExistente) {
        const especialidadPorDefecto = await prisma.especialidad.findFirst();
        if (!especialidadPorDefecto) {
          return res.status(400).json({ error: 'No hay especialidades disponibles' });
        }

        await prisma.medico.create({
          data: {
            nombre: actualizado.nombre,
            dni: actualizado.dni,
            email: actualizado.email,
            password: actualizado.password,
            especialidadId: especialidadPorDefecto.id
          }
        });
      }
    } else {
      if (medicoExistente) {
        await prisma.medico.delete({ where: { id: medicoExistente.id } });
      }
    }

    return res.json({
      mensaje: 'Usuario actualizado correctamente',
      usuario: actualizado
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};
