import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { generarToken } from '../utils/jwt';
import { registroUsuarioSchema, loginUsuarioSchema } from '../validations/schemas';

export const registerUser = async (req: Request, res: Response): Promise<Response | void> => {
  const parsed = registroUsuarioSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const {
    dni,
    nombre,
    email,
    password,
    fechaNacimiento,
    sexo,
    telefono,
    direccion
  } = parsed.data;

  try {
    const existe = await prisma.usuario.findFirst({
      where: {
        OR: [{ dni }, { email }]
      }
    });

    if (existe) {
      return res.status(400).json({ error: 'El usuario ya existe con ese DNI o correo' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        dni,
        nombre,
        email,
        password: hashedPassword,
        fechaNacimiento: new Date(fechaNacimiento),
        sexo,
        telefono,
        direccion,
        verificado: false,
        rol: 'PACIENTE'
      }
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        dni: nuevoUsuario.dni,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<Response | void> => {
  const parsed = loginUsuarioSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { dni, password } = parsed.data;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { dni } });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = generarToken({
      id: usuario.id,
      dni: usuario.dni,
      rol: usuario.rol
    });

    return res.json({
      mensaje: 'Login correcto',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        dni: usuario.dni,
        rol: usuario.rol,
        verificado: usuario.verificado
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error en el login' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dni: true,
        nombre: true,
        email: true,
        telefono: true,
        sexo: true,
        fechaNacimiento: true,
        direccion: true,
        verificado: true,
        rol: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(usuario);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};