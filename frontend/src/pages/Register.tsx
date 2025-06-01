import { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../auth/authService';

const registerSchema = z
  .object({
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
    confirmPassword: z.string().min(6, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword: _confirmPassword, ...userData } = data as Omit<RegisterFormData, 'confirmPassword'> & {
      confirmPassword: string;
    };

    try {
      await registerUser({
        ...userData,
        fechaNacimiento: `${data.fechaNacimiento}T00:00:00.000Z`,
      });

      navigate('/login');
    } catch {
      setError('Error al registrar. Intenta más tarde.');
    }
  };

  return (
    <StyledWrapper>
      <div className="form_wrapper">
        <div className="logo_column">
          <img src="/eSalut_logo.png" alt="Logo eSalut" className="logo_image" />
        </div>
        <form className="form_container" onSubmit={handleSubmit(onSubmit)}>
          <div className="title_container">
            <span className="subtitle">Crea tu cuenta para acceder a eSalut</span>
          </div>
          <br />

          <div className="input_container">
            <label className="input_label">DNI</label>
            <input {...register('dni')} className="input_field" placeholder="12345678A" />
            {errors.dni && <p className="error">{errors.dni.message}</p>}
          </div>

          <div className="input_container">
            <label className="input_label">Nombre completo</label>
            <input {...register('nombre')} className="input_field" placeholder="Juan Pérez" />
            {errors.nombre && <p className="error">{errors.nombre.message}</p>}
          </div>

          <div className="input_container">
            <label className="input_label">Email</label>
            <input {...register('email')} type="email" className="input_field" placeholder="correo@ejemplo.com" />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="input_container">
            <label className="input_label">Teléfono</label>
            <input {...register('telefono')} className="input_field" placeholder="600123456" />
            {errors.telefono && <p className="error">{errors.telefono.message}</p>}
          </div>

          <div className="input_container">
            <label className="input_label">Fecha de nacimiento</label>
            <input {...register('fechaNacimiento')} type="date" className="input_field" />
            {errors.fechaNacimiento && <p className="error">{errors.fechaNacimiento.message}</p>}
          </div>

          <div className="input_container">
            <label className="input_label">Sexo</label>
            <select {...register('sexo')} className="input_field">
              <option value="HOMBRE">Hombre</option>
              <option value="MUJER">Mujer</option>
              <option value="OTRO">Otro</option>
            </select>
            {errors.sexo && <p className="error">{errors.sexo.message}</p>}
          </div>

          <div className="input_container">
            <label className="input_label">Dirección (opcional)</label>
            <input {...register('direccion')} className="input_field" placeholder="Calle Ejemplo 123" />
          </div>

          <div className="input_container">
            <label className="input_label">Contraseña</label>
            <input type="password" {...register('password')} className="input_field" placeholder="••••••••" />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          <div className="input_container">
            <label className="input_label">Repetir contraseña</label>
            <input type="password" {...register('confirmPassword')} className="input_field" placeholder="••••••••" />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="register_btn">Registrarse</button>

          <button type="button" className="sign-in_btn" onClick={() => navigate('/login')}>
            Ya tengo cuenta
          </button>

          <p className="note">© eSalut 2025 – Condiciones de uso</p>
        </form>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: fixed;
  inset: 0;
  background-color: #009688;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  padding: 20px;

  .form_wrapper {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    background-color: #ffffff;
    border-radius: 11px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    max-width: 800px;
    width: 100%;
  }

  .logo_column {
    background-color: #E0F2F1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    min-width: 250px;
  }

  .logo_image {
    width: 180px;
    height: 180px;
    object-fit: contain;
  }

  .form_container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 40px;
    font-family: "Inter", sans-serif;
  }

  .title_container {
    text-align: center;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2E2E2E;
  }

  .subtitle {
    font-size: 0.85rem;
    color: #9E9E9E;
  }

  .input_container {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .input_label {
    font-size: 0.75rem;
    color: #9E9E9E;
    font-weight: 600;
  }

  .input_field {
    height: 40px;
    padding: 0 10px;
    border-radius: 7px;
    border: 1px solid #9E9E9E;
    font-size: 14px;
    color: #2E2E2E;
    background-color: #fff;
  }

  .input_field:focus {
    outline: 2px solid #009688;
  }

  .register_btn {
    height: 40px;
    background: #FF9800;
    color: white;
    border: none;
    border-radius: 7px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .register_btn:hover {
    background: #e08800;
  }

  .sign-in_btn {
    height: 40px;
    background: #009688;
    color: white;
    border: none;
    border-radius: 7px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .sign-in_btn:hover {
    background: #00796B;
  }

  .note {
    font-size: 0.7rem;
    color: #9E9E9E;
    text-align: center;
    margin-top: 10px;
  }

  .error {
    font-size: 0.75rem;
    color: #FF6F61;
    margin-top: -4px;
  }

  @media (max-width: 768px) {
    .form_wrapper {
      flex-direction: column;
    }

    .logo_column {
      padding: 20px;
      min-width: 100%;
    }

    .form_container {
      padding: 30px 20px;
    }
  }
`;
