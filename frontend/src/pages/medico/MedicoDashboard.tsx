import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useAuth } from "../../auth/useAuth";
import api from "../../api/axios";

interface Franja {
  id: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
}

interface NuevaFranja {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

interface Cita {
  id: number;
  usuario: { nombre: string };
  fecha: string;
  hora: string | undefined; 
  estado: "PENDIENTE" | "ACEPTADA" | "COMPLETADA";
}

interface Medicamento {
  id: number;
  nombre: string;
}

interface MedicamentoRecetadoItem {
  medicamentoId: number | string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

const diasSemana = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];

const MedicoDashboard = () => {
  const { user, logout } = useAuth();
  const [disponibilidad, setDisponibilidad] = useState<Franja[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [nuevaFranja, setNuevaFranja] = useState<NuevaFranja>({
    dia: "LUNES",
    horaInicio: "",
    horaFin: "",
  });
  const [citas, setCitas] = useState<Cita[]>([]);
  const [modalHora, setModalHora] = useState<{
    abierta: boolean;
    citaId: number | null;
    horaActual: string;
  }>({ abierta: false, citaId: null, horaActual: "" });
  const [nuevaHora, setNuevaHora] = useState("");
  const [modalDocumento, setModalDocumento] = useState<{
    abierta: boolean;
    citaId: number | null;
  }>({ abierta: false, citaId: null });
  const [observaciones, setObservaciones] = useState("");

  const [listaMedicamentos, setListaMedicamentos] = useState<Medicamento[]>([]);
  const [medicamentosRecetados, setMedicamentosRecetados] = useState<MedicamentoRecetadoItem[]>([]);

  const fetchDisponibilidad = async () => {
    try {
      const res = await api.get<Franja[]>("/disponibilidad/mis-franjas");
      setDisponibilidad(res.data);
    } catch (err) {
      console.error("Error al obtener disponibilidad", err);
    }
  };

  const fetchCitas = async () => {
    try {
      const res = await api.get<Cita[]>("/citas/medico");
      setCitas(res.data);
    } catch (err) {
      console.error("Error al obtener citas", err);
    }
  };

  const fetchMedicamentos = async () => {
    try {
      const res = await api.get<Medicamento[]>("/documentos/medicamentos");
      setListaMedicamentos(res.data);
    } catch (err) {
      console.error("Error al obtener medicamentos", err);
    }
  };


  const aceptarCitaConHora = (id: number, horaActual: string | undefined) => {
    setModalHora({ abierta: true, citaId: id, horaActual: horaActual || "" });
    setNuevaHora(horaActual ? horaActual.slice(0,5) : ''); 
  };

  const confirmarNuevaHora = async () => {
    if (!modalHora.citaId || !nuevaHora) {
      setMensaje("❌ Por favor, ingrese una hora válida.");
      setTimeout(() => setMensaje(null), 3000);
      return;
    }
    try {
      await api.patch(`/citas/${modalHora.citaId}/aceptar`, {
        hora: nuevaHora,
      });
      setModalHora({ abierta: false, citaId: null, horaActual: "" });
      setNuevaHora("");
      fetchCitas();
      setMensaje("✅ Cita aceptada y hora confirmada.");
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      console.error("Error al aceptar cita con hora", err);
      setMensaje("❌ Error al confirmar la hora de la cita.");
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const enviarDocumento = async () => {
    if (!modalDocumento.citaId || !observaciones.trim()) {
        setMensaje("❌ Las observaciones son obligatorias.");
        setTimeout(() => setMensaje(null), 3000);
        return;
    }
    try {
      await api.post("/documentos", {
        citaId: modalDocumento.citaId,
        observaciones,
        medicamentos: medicamentosRecetados
          .filter((m) => m.medicamentoId && m.dosis && m.frecuencia && m.duracion)
          .map(m => ({...m, medicamentoId: Number(m.medicamentoId)})),
      });
      setModalDocumento({ abierta: false, citaId: null });
      setObservaciones("");
      setMedicamentosRecetados([]);
      fetchCitas();
      setMensaje("✅ Documento guardado y cita completada.");
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      console.error("Error al guardar documento", err);
      setMensaje("❌ Error al guardar el documento.");
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const agregarFranja = async () => {
    if (!nuevaFranja.horaInicio || !nuevaFranja.horaFin) {
        setMensaje("❌ Hora de inicio y fin son requeridas.");
        setTimeout(() => setMensaje(null), 3000);
        return;
    }
    if (nuevaFranja.horaInicio >= nuevaFranja.horaFin) {
        setMensaje("❌ La hora de inicio debe ser anterior a la hora de fin.");
        setTimeout(() => setMensaje(null), 3000);
        return;
    }
    try {
      await api.post("/disponibilidad", nuevaFranja);
      setModalAbierto(false);
      setNuevaFranja({ dia: "LUNES", horaInicio: "", horaFin: "" });
      setMensaje("✅ Disponibilidad añadida correctamente");
      fetchDisponibilidad();
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      console.error("Error al añadir franja", err);
      setMensaje("❌ Error al añadir disponibilidad");
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const eliminarFranja = async (id: number) => {
    if (!confirm("¿Eliminar esta franja de disponibilidad?")) return;
    try {
      await api.delete(`/disponibilidad/${id}`);
      fetchDisponibilidad();
      setMensaje("✅ Franja eliminada.");
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      console.error("Error al eliminar franja", err);
      setMensaje("❌ Error al eliminar la franja.");
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  useEffect(() => {
    fetchDisponibilidad();
    fetchCitas();
    fetchMedicamentos();
  }, []);

  const handleMedicamentoChange = (
    index: number,
    field: keyof MedicamentoRecetadoItem,
    value: string | number
  ) => {
    const newMeds = [...medicamentosRecetados];
    const medToUpdate = newMeds[index];
  
    if (medToUpdate) {
      if (field === "medicamentoId") {
        medToUpdate[field] = value; 
      } else {
        medToUpdate[field] = String(value);
      }
      setMedicamentosRecetados(newMeds);
    }
  };

  const addMedicamentoRecetado = () => {
    setMedicamentosRecetados([
      ...medicamentosRecetados,
      { medicamentoId: "", dosis: "", frecuencia: "", duracion: "" },
    ]);
  };

  const removeMedicamentoRecetado = (index: number) => {
    setMedicamentosRecetados(medicamentosRecetados.filter((_, i) => i !== index));
  };


  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <Sidebar>
          <Logo>Panel Médico</Logo>
          <UserInfo>
            <span>{user?.nombre ?? "Médico"}</span>
            <LogoutButton onClick={() => { logout(); window.location.href = "/login"; }}>Cerrar sesión</LogoutButton>
          </UserInfo>
        </Sidebar>

        <MainContent>
          {mensaje && (
            <Mensaje tipo={mensaje.startsWith("✅") ? "ok" : "error"}>
              {mensaje.substring(2)}
            </Mensaje>
          )}
          <h1>Disponibilidad</h1>
          <AddButton onClick={() => setModalAbierto(true)}>
            + Añadir franja
          </AddButton>
          
          <FranjaList>
            {disponibilidad.length > 0 ? disponibilidad.map((f) => (
              <FranjaItem key={f.id}>
                <div>
                  <span>
                    {f.dia} — {f.horaInicio.slice(0, 5)} a {f.horaFin.slice(0, 5)}
                  </span>
                </div>
                <button onClick={() => eliminarFranja(f.id)}>🗑️ Eliminar</button>
              </FranjaItem>
            )) : <p>No hay franjas de disponibilidad configuradas.</p>}
          </FranjaList>

          <h1 style={{ marginTop: "40px" }}>Citas asignadas</h1>
          {citas.length === 0 ? (
            <p>No tienes citas asignadas</p>
          ) : (
            <FranjaList>
              {citas.map((cita) => (
                <FranjaItem key={cita.id}>
                  <div>
                    <strong>{cita.usuario.nombre}</strong>
                    <br />
                    {/* */}
                    <span>{new Date(cita.fecha).toLocaleDateString()} — {cita.hora ? cita.hora.slice(0,5) : 'Por definir'}</span>
                    <br />
                    <span>Estado: {cita.estado}</span>
                  </div>
                  <div className="action-buttons">
                    {cita.estado === "PENDIENTE" && (
                      <button
                        onClick={() => aceptarCitaConHora(cita.id, cita.hora)}
                      >
                        ✅ Aceptar
                      </button>
                    )}
                    {cita.estado === "ACEPTADA" && (
                      <button
                        onClick={() =>
                          setModalDocumento({ abierta: true, citaId: cita.id })
                        }
                      >
                        ✔ Completar
                      </button>
                    )}
                  </div>
                </FranjaItem>
              ))}
            </FranjaList>
          )}
        </MainContent>
      </Wrapper>

      {modalAbierto && (
        <ModalOverlay onClick={() => setModalAbierto(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <h3>Añadir Franja Horaria</h3>
            <label htmlFor="dia">Día:</label>
            <select
              id="dia"
              value={nuevaFranja.dia}
              onChange={(e) =>
                setNuevaFranja({ ...nuevaFranja, dia: e.target.value })
              }
            >
              {diasSemana.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <label htmlFor="horaInicioFranja">Hora inicio:</label>
            <input
              id="horaInicioFranja"
              type="time"
              value={nuevaFranja.horaInicio}
              onChange={(e) =>
                setNuevaFranja({ ...nuevaFranja, horaInicio: e.target.value })
              }
            />
            <label htmlFor="horaFinFranja">Hora fin:</label>
            <input
              id="horaFinFranja"
              type="time"
              value={nuevaFranja.horaFin}
              onChange={(e) =>
                setNuevaFranja({ ...nuevaFranja, horaFin: e.target.value })
              }
            />
            <ModalButtons>
              <button onClick={agregarFranja}>Guardar</button>
              <button type="button" onClick={() => setModalAbierto(false)}>Cancelar</button>
            </ModalButtons>
          </ModalContainer>
        </ModalOverlay>
      )}

      {modalHora.abierta && (
        <ModalOverlay
          onClick={() =>
            setModalHora({ abierta: false, citaId: null, horaActual: "" })
          }
        >
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <h3>Asignar hora a la cita</h3>
            <label htmlFor="nuevaHoraCita">Hora:</label>
            <input
              id="nuevaHoraCita"
              type="time"
              value={nuevaHora}
              onChange={(e) => setNuevaHora(e.target.value)}
            />
            <ModalButtons>
              <button onClick={confirmarNuevaHora}>Confirmar Hora</button>
              <button
                type="button"
                onClick={() =>
                  setModalHora({ abierta: false, citaId: null, horaActual: "" })
                }
              >
                Cancelar
              </button>
            </ModalButtons>
          </ModalContainer>
        </ModalOverlay>
      )}

    {modalDocumento.abierta && (
        <ModalOverlay
            onClick={() => {
            setModalDocumento({ abierta: false, citaId: null });
            setObservaciones("");
            setMedicamentosRecetados([]);
            }}
        >
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <h3>Finalizar Cita y Registrar Documento</h3>
            <label htmlFor="observacionesModal">Observaciones:</label>
            <textarea
              id="observacionesModal"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              required
            />
            <label>Medicamentos Recetados:</label>
            {medicamentosRecetados.map((m, index) => (
              <div key={index} className="medicamento-item">
                <div className="med-inputs">
                  <select
                    value={m.medicamentoId}
                    onChange={(e) => handleMedicamentoChange(index, "medicamentoId", e.target.value)}
                  >
                    <option value="">Selecciona medicamento</option>
                    {listaMedicamentos.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Dosis (e.g., 1 comprimido)"
                    value={m.dosis}
                    onChange={(e) => handleMedicamentoChange(index, "dosis", e.target.value)}
                  />
                  <input
                    placeholder="Frecuencia (e.g., cada 8 horas)"
                    value={m.frecuencia}
                    onChange={(e) => handleMedicamentoChange(index, "frecuencia", e.target.value)}
                  />
                  <input
                    placeholder="Duración (e.g., por 7 días)"
                    value={m.duracion}
                    onChange={(e) => handleMedicamentoChange(index, "duracion", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="remove-med-btn"
                  onClick={() => removeMedicamentoRecetado(index)}
                >
                  Eliminar Medicamento
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-med-btn"
              onClick={addMedicamentoRecetado}
            >
              ➕ Añadir Otro Medicamento
            </button>
            <ModalButtons>
              <button onClick={enviarDocumento}>Guardar Documento</button>
              <button
                type="button"
                onClick={() => {
                  setModalDocumento({ abierta: false, citaId: null });
                  setObservaciones(""); 
                  setMedicamentosRecetados([]); 
                }}
              >
                Cancelar
              </button>
            </ModalButtons>
          </ModalContainer>
        </ModalOverlay>
      )}
    </>
  );
};

export default MedicoDashboard;


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

  label { 
    display: block;
    font-weight: 500;
    color: #4a5568;
    font-size: 0.9rem;
    margin-bottom: 6px;
  }

  input, select, textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #2d3748;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      border-color: #00796B; 
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.2);
    }
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }
`;

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f7fafc;
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

const Logo = styled.h2` 
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 40px;
  padding-left: 6px;
  letter-spacing: 0.5px;
  color: #e0f2f1; 
`;

const UserInfo = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px; 

  span { 
    font-weight: 500;
    font-size: 0.95rem;
    padding: 8px 6px; 
    color: #b2dfdb; 
  }
`;

const LogoutButton = styled.button`
  padding: 10px 18px;
  background: #c0392b; 
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  text-align: center; 
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: #a93226;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 30px 45px;
  overflow-y: auto;

  h1 {
    font-size: 1.75rem;
    color: #1a202c;
    margin-bottom: 25px; 
  }
`;

const AddButton = styled.button`
  background: #38a169; 
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 25px; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;

  &:hover {
    background: #2f855a;
    transform: translateY(-1px);
  }
`;

const FranjaList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px; 
`;

const FranjaItem = styled.li`
  background: white;
  padding: 18px 22px;
  border: 1px solid #e2e8f0; 
  margin-bottom: 15px; 
  border-radius: 10px; 
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.07); 
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px; 

  div:first-child { 
    flex-grow: 1;
    font-size: 0.95rem;
    color: #4a5568;
    strong {
      color: #2d3748;
      font-weight: 600;
      display: block; 
      margin-bottom: 4px;
    }
    span {
        display: block; 
        margin-bottom: 2px;
        &:last-child {
            margin-bottom: 0;
        }
    }
  }

  .action-buttons { 
    display: flex;
    flex-direction: column; 
    gap: 8px;
    flex-shrink: 0; 
    @media (min-width: 768px) { 
        flex-direction: row;
    }
  }

  button { 
    background: transparent;
    border: 1px solid transparent;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    display: inline-flex; 
    align-items: center;
    justify-content: center; 
    gap: 6px; 
    min-width: 100px; 
  }

  button[onClick*="eliminarFranja"] { 
    color: #e53e3e;
    border-color: #e53e3e;
    &:hover {
      background-color: #fff5f5; 
      color: #c53030;
    }
  }
  button[onClick*="aceptarCitaConHora"] { 
    color: #38a169;
    border-color: #38a169;
    &:hover {
      background-color: #f0fff4; 
      color: #2f855a;
    }
  }
  button[onClick*="setModalDocumento"] { 
    color: #2b6cb0;
    border-color: #2b6cb0;
    &:hover {
      background-color: #ebf4ff; 
      color: #2c5282;
    }
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
  overflow-y: auto; 
`;

const ModalContainer = styled.div`
  background: white;
  padding: 28px 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 520px; 
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

  .medicamento-item {
    border: 1px solid #e2e8f0;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .med-inputs {
      display: grid;
      grid-template-columns: 1fr; 
      gap: 10px;
      @media (min-width: 500px) { 
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
    }
    
    select, input { margin-bottom: 0; } 

    button.remove-med-btn { 
      background: #fee2e2;
      color: #c53030;
      border: none;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      align-self: flex-end; 
      margin-top: 5px;
      font-weight: 500;
      &:hover {
        background: #fecaca;
      }
    }
  }

  button.add-med-btn { 
    background: #e0f2f1;
    color: #00796B;
    border: 1px dashed #00796B; 
    padding: 10px 15px;
    border-radius: 8px;
    text-align: center;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-top: 5px; 
    &:hover {
      background: #cce8e5;
    }
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 15px; 

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
  }

  button:first-child { 
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

const Mensaje = styled.p<{ tipo: "ok" | "error" }>`
  padding: 12px 18px; 
  border-radius: 8px; 
  margin-bottom: 20px;
  font-weight: 500;
  font-size: 0.95rem; 
  background-color: ${({ tipo }) => (tipo === "ok" ? "#e6fffa" : "#fff5f5")};
  color: ${({ tipo }) => (tipo === "ok" ? "#237a6a" : "#c53030")};
  border: 1px solid ${({ tipo }) => (tipo === "ok" ? "#38a169" : "#e53e3e")}; 
  position: sticky; 
  top: 20px;       
  z-index: 10;     
`;