import { z } from 'zod';

export const registroUsuarioSchema = z.object({
  dni: z.string().min(1, 'DNI requerido'),
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email no válido'),
  telefono: z.string().min(6, 'Teléfono requerido'),
  fechaNacimiento: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha inválida',
  }),
  sexo: z.enum(['HOMBRE', 'MUJER', 'OTRO']),
  direccion: z.string().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});


// Login de usuario (por DNI)
export const loginUsuarioSchema = z.object({
  dni: z.string().min(1, 'DNI requerido'),
  password: z.string().min(1, 'Contraseña requerida')
});

// Crear cita
export const crearCitaSchema = z.object({
  medicoId: z.number({ required_error: 'medicoId es obligatorio' }),
  fecha: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Fecha no válida'
  }),
  motivoConsulta: z.string().optional(),
  observaciones: z.string().optional(),
  tipo: z.string().optional(),
  presencial: z.boolean().optional()
});

// Editar cita
export const editarCitaSchema = z.object({
  medicoId: z.number({ invalid_type_error: "Medico ID debe ser un número" }).int().positive().optional(), // Added more specific error and validation
  
  // 👇 **THIS IS THE FIELD THAT WAS MISSING** 👇
  usuarioId: z.number({ invalid_type_error: "Usuario ID debe ser un número" }).int().positive().optional(),
  
  fecha: z.string().datetime({ message: "Formato de fecha inválido" }).optional().or(z.literal('')).refine( // Allow empty string or valid datetime
    (val) => val === undefined || val === '' || !isNaN(Date.parse(val)),
    { message: 'Fecha no válida' }
  ),
  motivoConsulta: z.string().optional(),
  observaciones: z.string().optional(),
  tipo: z.string().optional(),
  presencial: z.boolean().optional(),
  // This now correctly aligns with your SQL enum: ('PENDIENTE','COMPLETADA','CANCELADA')
  estado: z.enum(['PENDIENTE', 'COMPLETADA', 'CANCELADA']).optional()
});

// Crear o editar especialidad
export const especialidadSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio')
});

// Cambiar rol de usuario
export const cambiarRolSchema = z.object({
  rol: z.enum(['PACIENTE', 'ADMIN']) // Consider if 'MEDICO' should be an option here as well
});