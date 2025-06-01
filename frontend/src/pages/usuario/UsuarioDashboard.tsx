import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useAuth } from "../../auth/useAuth";
import api from "../../api/axios";

type Cita = {
  id: number;
  fecha: string;
  motivoConsulta?: string;
  estado: "PENDIENTE" | "COMPLETADA" | "CANCELADA";
  medico: { nombre: string; id: number };
};

type Medico = {
  id: number;
  nombre: string;
  especialidad: { nombre: string };
  disponibilidad: Franja[];
};

type Franja = {
  id: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
};

type Documento = {
  id: number;
  observaciones: string;
  medicamentos: string | null;
  cita: {
    fecha: string;
    medico: {
      nombre: string;
    };
  };
};

const GlobalStyle = createGlobalStyle`
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    background: #f7fafc;
    color: #2d3748;
    line-height: 1.5;
    scroll-behavior: smooth;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    font-weight: 600;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
  padding: 20px; 
`;

const ModalContainer = styled.div`
  background: white;
  padding: 28px 32px; 
  border-radius: 12px; 
  width: 100%;
  max-width: 480px; 
  display: flex;
  flex-direction: column;
  gap: 18px; 
  box-shadow: 0 5px 15px rgba(0,0,0,0.2); 

  h3 {
    font-size: 1.5rem;
    color: #1a202c;
    margin-bottom: 8px; 
    text-align: center;
  }

  label {
    font-weight: 500;
    color: #4a5568; 
    font-size: 0.9rem;
    margin-bottom: -10px; 
  }

  input[type="text"],
  select {
    width: 100%;
    padding: 12px 14px; 
    border: 1px solid #cbd5e0; 
    border-radius: 8px; 
    font-size: 0.95rem;
    color: #2d3748;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      border-color: #00796B; 
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.2); 
    }
  }

  p strong { 
    color: #00796B; 
  }
`;

const NoVerificadoModalOverlay = styled(ModalOverlay)`
  z-index: 1050;
`;

const NoVerificadoModalContainer = styled(ModalContainer)`
  max-width: 400px;
  text-align: center;

  h3 {
    color: #e53e3e;
  }

  p {
    margin-bottom: 20px;
    line-height: 1.6;
  }
`;

const UsuarioDashboard = () => {
  const { user, logout } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<Franja[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [horaEstimada, setHoraEstimada] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [mostrarModalNoVerificado, setMostrarModalNoVerificado] = useState(false);

  useEffect(() => {
    if (user && user.verificado === false) {
      setMostrarModalNoVerificado(true);
    } else if (user && user.verificado === true) {
      setMostrarModalNoVerificado(false);
    }
  }, [user]);

  const [nuevaCita, setNuevaCita] = useState({
    medicoId: "",
    franjaId: "",
    motivoConsulta: "",
    tipo: "presencial",
  });

  const fetchCitas = async () => {
    if (user && !user.verificado) return;
    try {
      const res = await api.get<Cita[]>("/citas/mis-citas");
      setCitas(res.data);
    } catch (error) {
      console.error("Error al cargar las citas", error);
    }
  };

  const fetchMedicos = async () => {
    if (user && !user.verificado) return;
    try {
      const res = await api.get<Medico[]>("/medicos/public");
      setMedicos(res.data);
    } catch (error) {
      console.error("Error al cargar los médicos", error);
    }
  };

  useEffect(() => {
    if (user && user.verificado) {
        fetchCitas();
        fetchMedicos();
    }
  }, [user]);

  useEffect(() => {
    const fetchDocumentos = async () => {
      if (user && !user.verificado) return;
      try {
        const res = await api.get<Documento[]>("/documentos/usuario", {
          headers: {
            usuarioid: user?.id,
          },
        });
        setDocumentos(res.data);
      } catch (error) {
        console.error("Error al cargar documentos:", error);
      }
    };

    if (user?.id && user.verificado) fetchDocumentos();
  }, [user]);

  const calcularHoraEstimada = () => {
    const franja = disponibilidad.find(
      (f) => f.id === parseInt(nuevaCita.franjaId)
    );
    if (!franja) {
      setHoraEstimada(null);
      return;
    }

    const hoy = new Date();
    const diaOffset = [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SABADO",
    ].indexOf(franja.dia);
    const fechaBase = new Date(hoy);
    fechaBase.setDate(hoy.getDate() + ((7 + diaOffset - hoy.getDay()) % 7));

    const [horaInicio, minutoInicio] = franja.horaInicio.split(":").map(Number);
    const [horaFin, minutoFin] = franja.horaFin.split(":").map(Number);

    const esHoy = diaOffset === hoy.getDay();
    const yaPasoLaHora =
      esHoy &&
      (hoy.getHours() > horaFin ||
        (hoy.getHours() === horaFin && hoy.getMinutes() >= minutoFin));

    if (yaPasoLaHora) {
      fechaBase.setDate(fechaBase.getDate() + 7);
    }

    const inicioFranja = new Date(fechaBase);
    inicioFranja.setHours(horaInicio, minutoInicio, 0, 0);

    const finFranja = new Date(fechaBase);
    finFranja.setHours(horaFin, minutoFin, 0, 0);

    const citasMedicoEseDia = citas
      .filter(
        (c) =>
          c.medico.id === parseInt(nuevaCita.medicoId) &&
          new Date(c.fecha).toDateString() === fechaBase.toDateString() &&
          c.estado === "PENDIENTE"
      )
      .map((c) => new Date(c.fecha))
      .sort((a, b) => a.getTime() - b.getTime());

    let fechaFinal = new Date(inicioFranja);
    const haySolapamiento = (fecha: Date) => {
      return citasMedicoEseDia.some((cita) => {
        const diferencia = Math.abs(cita.getTime() - fecha.getTime());
        return diferencia < 15 * 60 * 1000;
      });
    };

    while (haySolapamiento(fechaFinal) && fechaFinal < finFranja) {
      fechaFinal.setMinutes(fechaFinal.getMinutes() + 15);
    }

    if (fechaFinal >= finFranja) {
        fechaBase.setDate(fechaBase.getDate() + 7);
        const nextWeekInicioFranja = new Date(fechaBase);
        nextWeekInicioFranja.setHours(horaInicio, minutoInicio, 0, 0);
        
        fechaFinal = new Date(nextWeekInicioFranja);
        while (haySolapamiento(fechaFinal) && fechaFinal < new Date(fechaBase).setHours(horaFin, minutoFin, 0, 0) ) {
          fechaFinal.setMinutes(fechaFinal.getMinutes() + 15);
        }
        if (fechaFinal >= new Date(fechaBase).setHours(horaFin, minutoFin, 0, 0)){
            setHoraEstimada("No hay disponibilidad próxima en esta franja. Intente otra.");
            return;
        }
    }
    
    setHoraEstimada(fechaFinal.toLocaleString());
  };

  useEffect(() => {
    if (nuevaCita.medicoId && nuevaCita.franjaId) {
      calcularHoraEstimada();
    }
  }, [nuevaCita.medicoId, nuevaCita.franjaId, citas]);

  const cancelarCita = async (id: number) => {
    if (!confirm("¿Deseas cancelar esta cita?")) return;
    try {
      await api.put(`/citas/${id}`, { estado: "CANCELADA" });
      fetchCitas();
    } catch (err) {
      console.error("Error al cancelar cita", err);
    }
  };

  const crearCita = async () => {
    if (!horaEstimada || horaEstimada.startsWith("No hay disponibilidad")) {
        alert("Por favor, seleccione una franja con disponibilidad o verifique la hora estimada.");
        return;
    }
    let fechaFinalConfirmada;
    try {
        const parsedDate = new Date(horaEstimada);
        if (isNaN(parsedDate.getTime())) {
            throw new Error("Invalid date format in horaEstimada");
        }
        fechaFinalConfirmada = parsedDate;

    } catch (e) {
        console.error("Error parsing horaEstimada for cita creation:", e);
        alert("Error con la hora estimada. Por favor, re-seleccione la franja.");
        return;
    }

    const confirmacion = confirm(
      `¿Deseas confirmar la cita para: ${fechaFinalConfirmada.toLocaleString()}?`
    );
    if (!confirmacion) return;

    try {
      await api.post("/citas/crear", {
        medicoId: parseInt(nuevaCita.medicoId),
        fecha: fechaFinalConfirmada.toISOString(),
        motivoConsulta: nuevaCita.motivoConsulta,
        presencial: nuevaCita.tipo === "presencial",
      });
      setMostrarModal(false);
      setNuevaCita({
        medicoId: "",
        franjaId: "",
        motivoConsulta: "",
        tipo: "presencial",
      });
      setHoraEstimada(null);
      fetchCitas();
    } catch (err) {
      console.error("Error al crear cita", err);
      alert("Hubo un error al crear la cita. Por favor, inténtelo de nuevo.");
    }
  };

  const [seccionActiva, setSeccionActiva] = useState<"citas" | "documentos">(
    "citas"
  );

  if (!user) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <Sidebar>
          <Logo>eSalut</Logo>
          <MenuItem
            active={seccionActiva === "citas"}
            onClick={() => setSeccionActiva("citas")}
          >
            Mis citas
          </MenuItem>
          <MenuItem
            active={seccionActiva === "documentos"}
            onClick={() => setSeccionActiva("documentos")}
          >
            Mis documentos
          </MenuItem>
          <LogoutButton
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
          >
            Cerrar sesión
          </LogoutButton>
        </Sidebar>

        <Main>
          <Header>
            <h1>Bienvenido, {user?.nombre}</h1>
            {seccionActiva === "citas" && user.verificado && (
              <SolicitarBtn 
                onClick={() => {
                    if (!user.verificado) {
                        setMostrarModalNoVerificado(true);
                        return;
                    }
                    setMostrarModal(true);
                }}
              >
                ➕ Solicitar nueva cita
              </SolicitarBtn>
            )}
          </Header>

          {user.verificado ? (
            <>
              {seccionActiva === "citas" && (
                <Section>
                  <SectionHeader>Tus próximas citas</SectionHeader>
                  {citas.length === 0 ? (
                    <p>No tienes citas registradas.</p>
                  ) : (
                    <CitaTable>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Médico</th>
                          <th>Motivo</th>
                          <th>Estado</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {citas.map((cita) => (
                          <tr key={cita.id}>
                            <td>{new Date(cita.fecha).toLocaleString()}</td>
                            <td>{cita.medico.nombre}</td>
                            <td>{cita.motivoConsulta || "No especificado"}</td>
                            <td>{cita.estado}</td>
                            <td>
                              {cita.estado === "PENDIENTE" && (
                                <CancelBtn onClick={() => cancelarCita(cita.id)}>
                                  Cancelar
                                </CancelBtn>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </CitaTable>
                  )}
                </Section>
              )}

              {seccionActiva === "documentos" && (
                <Section>
                  <SectionHeader>Mis documentos médicos</SectionHeader>
                  {documentos.length === 0 ? (
                    <p>No tienes documentos registrados.</p>
                  ) : (
                    <CitaTable>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Médico</th>
                          <th>Observaciones</th>
                          <th>Medicamentos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documentos.map((doc) => (
                          <tr key={doc.id}>
                            <td>{new Date(doc.cita.fecha).toLocaleString()}</td>
                            <td>{doc.cita.medico.nombre}</td>
                            <td>{doc.observaciones}</td>
                            <td>{doc.medicamentos || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </CitaTable>
                  )}
                </Section>
              )}
            </>
          ) : (
            <Section>
                <SectionHeader>Acceso Restringido</SectionHeader>
                <p>Tu cuenta aún no ha sido verificada por un administrador. Por favor, espera la verificación para acceder a todas las funcionalidades.</p>
            </Section>
          )}
        </Main>
      </Wrapper>

      {mostrarModal && user.verificado && (
        <ModalOverlay onClick={() => setMostrarModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <h3>Solicitar nueva cita</h3>

            <label>Médico:</label>
            <select
              value={nuevaCita.medicoId}
              onChange={(e) => {
                const id = e.target.value;
                setNuevaCita({ ...nuevaCita, medicoId: id, franjaId: "" });
                const medico = medicos.find((m) => m.id.toString() === id);
                setDisponibilidad(medico?.disponibilidad || []);
                setHoraEstimada(null);
              }}
            >
              <option value="">Seleccione un médico</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.especialidad?.nombre})
                </option>
              ))}
            </select>

            <label>Franja horaria:</label>
            <select
              value={nuevaCita.franjaId}
              onChange={(e) => {
                setNuevaCita({ ...nuevaCita, franjaId: e.target.value });
              }}
              disabled={!nuevaCita.medicoId}
            >
              <option value="">Seleccione una franja</option>
              {disponibilidad.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.dia} — {f.horaInicio.slice(0, 5)} a {f.horaFin.slice(0, 5)}
                </option>
              ))}
            </select>

            {horaEstimada && (
              <p>
                <strong>Hora estimada de cita:</strong> {horaEstimada}
              </p>
            )}

            <label>Motivo de consulta:</label>
            <input
              type="text"
              value={nuevaCita.motivoConsulta}
              onChange={(e) =>
                setNuevaCita({ ...nuevaCita, motivoConsulta: e.target.value })
              }
            />

            <label>Tipo:</label>
            <select
              value={nuevaCita.tipo}
              onChange={(e) =>
                setNuevaCita({ ...nuevaCita, tipo: e.target.value })
              }
            >
              <option value="presencial">Presencial</option>
              <option value="videollamada">Videollamada</option>
            </select>

            <ModalButtons>
              <button onClick={crearCita} disabled={!horaEstimada || horaEstimada.startsWith("No hay")}>Crear</button>
              <button onClick={() => {
                setMostrarModal(false);
                setHoraEstimada(null);
                setNuevaCita({ medicoId: "", franjaId: "", motivoConsulta: "", tipo: "presencial"});
                setDisponibilidad([]);
              }}>Cancelar</button>
            </ModalButtons>
          </ModalContainer>
        </ModalOverlay>
      )}

      {mostrarModalNoVerificado && (
        <NoVerificadoModalOverlay>
          <NoVerificadoModalContainer onClick={(e) => e.stopPropagation()}>
            <h3>Cuenta Pendiente de Verificación</h3>
            <p>
              Tu cuenta de usuario aún no ha sido verificada por un administrador.
              Por favor, ten paciencia. Se te notificará una vez que tu cuenta esté activa.
            </p>
            <p>
              Si crees que esto es un error o ha pasado mucho tiempo, puedes contactar con el soporte.
            </p>
            <ModalButtons>
              <button 
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
                style={{ background: '#718096', color: 'white' }}
              >
                Cerrar Sesión
              </button>
            </ModalButtons>
          </NoVerificadoModalContainer>
        </NoVerificadoModalOverlay>
      )}
    </>
  );
};

export default UsuarioDashboard;

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f9f9; 
`;

const Sidebar = styled.aside`
  width: 250px; 
  background: #00796B; 
  color: white;
  display: flex;
  flex-direction: column;
  padding: 24px 18px; 
  box-shadow: 2px 0 5px rgba(0,0,0,0.1); 
`;

const Logo = styled.div`
  font-size: 1.8rem; 
  font-weight: bold;
  margin-bottom: 40px; 
  padding-left: 6px; 
  letter-spacing: 0.5px;
  color: #e0f2f1; 
`;

const MenuItem = styled.div<{ active?: boolean }>`
  padding: 14px 18px; 
  border-radius: 8px;
  background: ${({ active }) => (active ? "rgba(255, 255, 255, 0.2)" : "transparent")}; 
  color: white;
  font-weight: 500; 
  margin-bottom: 10px; 
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;

  &:hover {
    background: ${({ active }) => (active ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)")};
    transform: ${({ active }) => (active ? "none" : "translateX(3px)")}; 
  }
`;

const LogoutButton = styled.button`
  margin-top: auto;
  padding: 12px 18px;
  background: #c0392b; 
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  text-align: left; 
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: #a93226; 
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 30px 45px; 
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px; 

  h1 {
    font-size: 1.75rem; 
    color: #1a202c; 
  }
`;

const SolicitarBtn = styled.button`
  background: #38a169; 
  color: white;
  border: none;
  padding: 12px 18px; 
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600; 
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;

  &:hover {
    background: #2f855a; 
    transform: translateY(-1px);
  }
`;

const Section = styled.section`
  margin-top: 35px;
  background: white;
  padding: 25px 30px; 
  border-radius: 12px; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
`;

const SectionHeader = styled.h2`
  margin-bottom: 20px;
  font-size: 1.4rem; 
  color: #2d3748; 
  border-bottom: 1px solid #e2e8f0; 
  padding-bottom: 10px;
`;

const CitaTable = styled.table`
  width: 100%;
  border-collapse: collapse; 
  font-size: 0.9rem;

  th,
  td {
    padding: 14px 18px; 
    border-bottom: 1px solid #e2e8f0; 
    text-align: left; 
  }

  th {
    background: #f7fafc; 
    font-weight: 600; 
    color: #4a5568; 
    text-transform: uppercase; 
    font-size: 0.75rem; 
    letter-spacing: 0.05em;
  }

  tbody tr {
    transition: background-color 0.15s ease-in-out;
    &:hover {
      background-color: #f7fafc; 
    }
  }

  td {
    color: #4a5568; 
  }
`;

const CancelBtn = styled.button`
  background: #e53e3e; 
  color: white;
  padding: 8px 14px; 
  border: none;
  border-radius: 6px;
  font-weight: 500; 
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: #c53030; 
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end; 
  gap: 12px; 
  margin-top: 12px; 

  button {
    padding: 10px 20px; 
    border: none;
    border-radius: 8px; 
    font-weight: 600; 
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s ease-in-out, transform 0.1s ease;

    &:hover {
      transform: translateY(-1px);
    }
    &:disabled {
      background-color: #ccc;
      color: #666;
      cursor: not-allowed;
      transform: none;
    }
  }

  button:first-child:not(:disabled) {
    background: #38a169; 
    color: white;
    &:hover {
      background: #2f855a;
    }
  }

  button:last-child {
    background: #e2e8f0; 
    color: #2d3748; 
    &:hover {
      background: #cbd5e0; 
    }
  }
`;