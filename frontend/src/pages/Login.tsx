import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../auth/authService';
import { useAuth } from '../auth/useAuth';

const loginSchema = z.object({
  dni: z.string().min(1, 'DNI requerido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { token, usuario } = await loginUser(data);
      login(token, usuario); // ✅ Guarda usuario completo

      console.log('ROL DEVUELTO DESDE BACKEND:', usuario.rol);

      // Redirige según rol
      if (usuario.rol === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (usuario.rol === 'MEDICO') {
        navigate('/medico/dashboard');
      } else {
        navigate('/usuario/dashboard');
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError('DNI o contraseña incorrectos');
        } else {
          setError('Error del servidor al iniciar sesión');
        }
      } else {
        setError('Error inesperado');
      }
    }
  };

  return (
    <StyledWrapper>
      <form className="form_container" onSubmit={handleSubmit(onSubmit)}>
        <img src="/eSalut_logo.png" alt="Logo eSalut" className="logo_image" />
        <div className="title_container">
          <p className="title">Iniciar sesión</p>
          <span className="subtitle">
            Accede con tu cuenta para gestionar tus citas médicas
          </span>
        </div>
        <br />

        <div className="input_container">
          <label className="input_label" htmlFor="dni_field">DNI</label>
          <input
            id="dni_field"
            type="text"
            placeholder="12345678A"
            {...register('dni')}
            className="input_field"
          />
          {errors.dni && <p className="error">{errors.dni.message}</p>}
        </div>

        <div className="input_container">
          <label className="input_label" htmlFor="password_field">Contraseña</label>
          <input
            id="password_field"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="input_field"
          />
          {errors.password && <p className="error">{errors.password.message}</p>}
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="sign-in_btn">Entrar</button>

        <button type="button" className="register_btn" onClick={() => navigate('/register')}>
          Crear cuenta
        </button>

        <div className="separator">
          <hr className="line" />
          <span>O</span>
          <hr className="line" />
        </div>

        <button type="button" className="sign-in_clave" disabled>
          Acceder con Cl@ve (en mantenimiento)
        </button>

        <p className="note">© eSalut 2025 – Condiciones de uso</p>
      </form>
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

  .form_container {
    width: fit-content;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 50px 40px 20px 40px;
    background-color: #ffffff;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
    border-radius: 11px;
    font-family: "Inter", sans-serif;
  }

  .logo_image {
    width: 120px;
    height: 120px;
    object-fit: contain;
    margin: 0 auto 10px auto;
  }

  .title_container {
    text-align: center;
  }

  .title {
    font-size: 1.25rem;
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

  .sign-in_btn {
    height: 40px;
    background: #009688;
    color: #fff;
    border: none;
    border-radius: 7px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .sign-in_btn:hover {
    background: #00796B;
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

  .sign-in_clave {
    height: 40px;
    background: #E0E0E0;
    color: #777;
    border: none;
    border-radius: 7px;
    font-weight: 500;
    cursor: not-allowed;
    opacity: 0.8;
  }

  .separator {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.75rem;
    color: #9E9E9E;
    text-align: center;
  }

  .line {
    flex: 1;
    height: 1px;
    background-color: #E0E0E0;
    border: none;
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
`;
