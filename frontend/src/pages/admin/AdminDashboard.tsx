import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useAuth } from '../../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

type Usuario = {
  id: number;
  nombre: string;
  dni: string;
  email: string;
  verificado: boolean;
  rol: 'PACIENTE' | 'MEDICO' | 'ADMIN';
};

type Medico = {
  id: number;
  nombre: string;
  dni: string;
  email: string;
  especialidad: { nombre: string };
  especialidadId: number;
};

type Especialidad = {
  id: number;
  nombre: string;
};

type Medicamento = {
  id: number;
  nombre: string;
  descripcion: string;
  fabricante: string;
};

type Cita = {
  id: number;
  fecha: string;
  usuarioId: number;
  medicoId: number;
  usuario?: { nombre: string };
  medico?: { nombre: string };
  pacienteNombre?: string;
  medicoNombre?: string;
  motivoConsulta: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA_PACIENTE' | 'CANCELADA_MEDICO' | 'ACEPTADA' | 'CANCELADA' | string; // Ensure 'CANCELADA' from SQL is covered
  
};

const GlobalStyle = createGlobalStyle`
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

const AddButton = styled.button`
  background-color: #00796B;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 0.95rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #00695C;
  }
`;


const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('usuarios');

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);
  const [modalUsuario, setModalUsuario] = useState<Usuario | null>(null);

  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<number | null>(null);
  const [modalMedico, setModalMedico] = useState<Medico | null>(null);

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState<number | null>(null);
  const [modalMedicamento, setModalMedicamento] = useState<Partial<Medicamento> | null>(null);

  const [citas, setCitas] = useState<Cita[]>([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState<number | null>(null);
  const [modalCita, setModalCita] = useState<Partial<Cita> | null>(null);

  const [popupMensaje, setPopupMensaje] = useState<string | null>(null);

  const [pacientesParaSelector, setPacientesParaSelector] = useState<Usuario[]>([]);
  const [medicosParaSelector, setMedicosParaSelector] = useState<Medico[]>([]);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleUsuario = (id: number) => {
    setUsuarioSeleccionado((prevId) => (prevId === id ? null : id));
  };

  const toggleMedico = (id: number) => {
    setMedicoSeleccionado((prevId) => (prevId === id ? null : id));
  };

  const toggleMedicamento = (id: number) => {
    setMedicamentoSeleccionado((prevId) => (prevId === id ? null : id));
  };

  const toggleCita = (id: number) => {
    setCitaSeleccionada((prevId) => (prevId === id ? null : id));
  };

  const fetchUsuarios = async () => {
    try {
      const res = await api.get<Usuario[]>('/usuarios');
      setUsuarios(res.data);
      setPacientesParaSelector(res.data.filter(u => u.rol === 'PACIENTE'));
    } catch (err) {
      console.error('Error al obtener los usuarios:', err);
      setPopupMensaje('❌ Error al cargar usuarios');
    }
  };

  const fetchMedicos = async () => {
    try {
      const [medicoRes, especRes] = await Promise.all([
        api.get<Medico[]>('/medicos'),
        api.get<Especialidad[]>('/especialidades')
      ]);
      setMedicos(medicoRes.data);
      setEspecialidades(especRes.data);
      setMedicosParaSelector(medicoRes.data);
    } catch (err) {
      console.error('Error al obtener médicos o especialidades:', err);
      setPopupMensaje('❌ Error al cargar médicos');
    }
  };

  const fetchMedicamentos = async () => {
    try {
      const res = await api.get<Medicamento[]>('/medicamentos');
      setMedicamentos(res.data);
    } catch (err) {
      console.error('Error al obtener los medicamentos:', err);
      setPopupMensaje('❌ Error al cargar medicamentos');
    }
  };

  const fetchCitas = async () => {
    try {
      const res = await api.get<Cita[]>('/citas/admin');
      const citasConNombresMapeados = res.data.map(cita => ({
        ...cita,
        pacienteNombre: cita.usuario?.nombre,
        medicoNombre: cita.medico?.nombre,
      }));
      setCitas(citasConNombresMapeados);
      if (pacientesParaSelector.length === 0) await fetchUsuarios();
      if (medicosParaSelector.length === 0) await fetchMedicos();
    } catch (err) {
      console.error('Error al obtener las citas:', err);
      setPopupMensaje('❌ Error al cargar citas');
    }
  };


  const verificarUsuario = async (id: number) => {
    try {
      await api.put(`/usuarios/${id}/verificar`);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, verificado: true } : u))
      );
      setPopupMensaje('✅ Usuario verificado correctamente');
    } catch (error) {
      console.error('Error al verificar usuario', error);
      setPopupMensaje('❌ Error al verificar usuario');
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      setPopupMensaje('🗑 Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar usuario', error);
      setPopupMensaje('❌ Error al eliminar usuario');
    }
  };

  const guardarCambiosUsuario = async () => {
    if (!modalUsuario) return;
    try {
      await api.put(`/usuarios/${modalUsuario.id}`, modalUsuario);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === modalUsuario.id ? modalUsuario : u))
      );
      setModalUsuario(null);
      setPopupMensaje('✏️ Usuario actualizado correctamente');
    } catch (err) {
      console.error('Error al guardar usuario', err);
      setPopupMensaje('❌ Error al actualizar usuario');
    }
  };

  const eliminarMedico = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este médico? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/medicos/${id}`);
      setMedicos((prev) => prev.filter((m) => m.id !== id));
      setPopupMensaje('🗑 Médico eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar médico', error);
      setPopupMensaje('❌ Error al eliminar médico');
    }
  };

  const guardarCambiosMedico = async () => {
    if (!modalMedico) return;
    try {
      await api.put(`/medicos/${modalMedico.id}`, {
        especialidadId: modalMedico.especialidadId
      });
      const especialidadActualizada = especialidades.find(e => e.id === modalMedico.especialidadId);
      setMedicos((prev) =>
        prev.map((m) =>
          m.id === modalMedico.id
            ? {
                ...m,
                especialidadId: modalMedico.especialidadId,
                especialidad: especialidadActualizada || m.especialidad
              }
            : m
        )
      );
      setModalMedico(null);
      setPopupMensaje('✏️ Especialidad del médico actualizada');
    } catch (err) {
      console.error('Error al guardar médico', err);
      setPopupMensaje('❌ Error al actualizar médico');
    }
  };

  const eliminarMedicamento = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este medicamento? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/medicamentos/${id}`);
      setMedicamentos((prev) => prev.filter((med) => med.id !== id));
      setPopupMensaje('🗑 Medicamento eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar medicamento', error);
      setPopupMensaje('❌ Error al eliminar medicamento');
    }
  };

  const guardarCambiosMedicamento = async () => {
    if (!modalMedicamento) return;
    const { id, ...medicamentoData } = modalMedicamento;
    try {
      if (id && id !== 0) {
        await api.put(`/medicamentos/${id}`, medicamentoData);
        setMedicamentos((prev) =>
          prev.map((med) => (med.id === id ? { ...med, ...medicamentoData, id: id } as Medicamento : med))
        );
        setPopupMensaje('✏️ Medicamento actualizado correctamente');
      } else {
        const response = await api.post<Medicamento>('/medicamentos', medicamentoData);
        setMedicamentos((prev) => [...prev, response.data]);
        setPopupMensaje('✅ Medicamento añadido correctamente');
      }
      setModalMedicamento(null);
    } catch (err) {
      console.error('Error al guardar medicamento', err);
      setPopupMensaje(id && id !== 0 ? '❌ Error al actualizar medicamento' : '❌ Error al añadir medicamento');
    }
  };

  const handleAbrirModalNuevoMedicamento = () => {
    setModalMedicamento({
      nombre: '',
      descripcion: '',
      fabricante: '',
    });
  };

  const eliminarCita = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta cita? Esta acción no se puede deshacer. (Requiere backend)')) return;
    try {
      await api.delete(`/citas/${id}`);
      setCitas((prev) => prev.filter((c) => c.id !== id));
      setPopupMensaje('🗑 Cita eliminada correctamente (si el backend lo soporta)');
    } catch (error) {
      console.error('Error al eliminar cita (verificar backend):', error);
      setPopupMensaje('❌ Error al eliminar cita (endpoint backend faltante)');
    }
  };

  const guardarCambiosCita = async () => {
    if (!modalCita || !modalCita.id) {
      setPopupMensaje('❌ No se puede guardar la cita sin ID');
      return;
    }

    const { id, fecha, usuarioId, medicoId, motivoConsulta, estado } = modalCita;
    const finalUsuarioId = (typeof usuarioId === 'number' && usuarioId > 0) ? usuarioId : undefined;
    const finalMedicoId = (typeof medicoId === 'number' && medicoId > 0) ? medicoId : undefined;

    const citaDataToUpdate: any = { 
      fecha: fecha || undefined,
      motivoConsulta: motivoConsulta,
      estado: estado,
    };

    if (finalUsuarioId !== undefined) {
        citaDataToUpdate.usuarioId = finalUsuarioId;
    }
    if (finalMedicoId !== undefined) {
        citaDataToUpdate.medicoId = finalMedicoId;
    }
    



    console.log('Enviando para actualizar cita:', JSON.stringify(citaDataToUpdate, null, 2));

    try {
      const response = await api.put<Cita>(`/citas/${id}`, citaDataToUpdate);

      setCitas((prev) =>
        prev.map((c) => (c.id === id ? {
            ...c,
            ...response.data,
            pacienteNombre: response.data.usuario?.nombre || pacientesParaSelector.find(p => p.id === Number(response.data.usuarioId))?.nombre,
            medicoNombre: response.data.medico?.nombre || medicosParaSelector.find(m => m.id === Number(response.data.medicoId))?.nombre,
        } : c))
      );
      setModalCita(null);
      setPopupMensaje('✏️ Cita actualizada correctamente');
    } catch (err: any) {
      console.error('Error al guardar cita', err);
      if (err.response && err.response.data && err.response.data.error) {
        console.error('Detalles del error del backend:', JSON.stringify(err.response.data.error, null, 2));
        const errorMessages = flattenZodError(err.response.data.error);
        setPopupMensaje(`❌ Error al actualizar: ${errorMessages.join(', ')}`);
      } else {
        setPopupMensaje('❌ Error al actualizar cita');
      }
    }
  };
  
  const flattenZodError = (errorObj: any): string[] => {
    const messages: string[] = [];
    if (errorObj && typeof errorObj === 'object') {
      for (const key in errorObj) {
        if (key === '_errors' && Array.isArray(errorObj[key])) {
          messages.push(...errorObj[key]);
        } else if (typeof errorObj[key] === 'object') {
          messages.push(...flattenZodError(errorObj[key]));
        }
      }
    }
    return messages.filter((msg, index, self) => msg && self.indexOf(msg) === index);
  };


  useEffect(() => {
    if (activeSection === 'usuarios') fetchUsuarios();
    if (activeSection === 'medicos') fetchMedicos();
    if (activeSection === 'medicamentos') fetchMedicamentos();
    if (activeSection === 'citas') fetchCitas();
  }, [activeSection]);

  useEffect(() => {
    if (popupMensaje) {
      const timeout = setTimeout(() => setPopupMensaje(null), 3800); 
      return () => clearTimeout(timeout);
    }
  }, [popupMensaje]);

  const formatDateTime = (dateTimeString: string | undefined) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      return dateTimeString;
    }
  };

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <Sidebar>
          <Logo>eSalut Admin</Logo>
          {/* Using $active transient prop for MenuButton */}
          <MenuButton $active={activeSection === 'usuarios'} onClick={() => setActiveSection('usuarios')}>Usuarios</MenuButton>
          <MenuButton $active={activeSection === 'medicos'} onClick={() => setActiveSection('medicos')}>Médicos</MenuButton>
          <MenuButton $active={activeSection === 'medicamentos'} onClick={() => setActiveSection('medicamentos')}>Medicamentos</MenuButton>
          <MenuButton $active={activeSection === 'citas'} onClick={() => setActiveSection('citas')}>Citas</MenuButton>
          <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
        </Sidebar>

        <MainContent>
          <h1>Bienvenido, {user?.nombre ?? 'Administrador'}</h1>

          {activeSection === 'usuarios' && (
            <>
              <h2>Lista de Usuarios</h2>
              <UserTable>
                <thead>
                  <tr><th>ID</th><th>Nombre</th><th>DNI</th><th>Email</th><th>Verificado</th><th>Rol</th></tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <React.Fragment key={usuario.id}>
                      <tr onClick={() => toggleUsuario(usuario.id)} style={{cursor: 'pointer'}}>
                        <td>{usuario.id}</td><td>{usuario.nombre}</td><td>{usuario.dni}</td><td>{usuario.email}</td><td>{usuario.verificado ? 'Sí' : 'No'}</td><td>{usuario.rol}</td>
                      </tr>
                      {usuarioSeleccionado === usuario.id && (
                        <tr><td colSpan={6}>
                          <ActionPanel>
                            <button onClick={() => setModalUsuario(usuario)}>✏️ Editar</button>
                            {!usuario.verificado && <button onClick={() => verificarUsuario(usuario.id)}>✅ Verificar</button>}
                            <button onClick={() => eliminarUsuario(usuario.id)}>🗑 Eliminar</button>
                          </ActionPanel>
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </UserTable>
            </>
          )}

          {activeSection === 'medicos' && (
            <>
              <h2>Lista de Médicos</h2>
              <UserTable>
                <thead>
                  <tr><th>ID</th><th>Nombre</th><th>DNI</th><th>Email</th><th>Especialidad</th></tr>
                </thead>
                <tbody>
                  {medicos.map((medico) => (
                    <React.Fragment key={medico.id}>
                      <tr onClick={() => toggleMedico(medico.id)} style={{cursor: 'pointer'}}>
                        <td>{medico.id}</td><td>{medico.nombre}</td><td>{medico.dni}</td><td>{medico.email}</td><td>{medico.especialidad?.nombre || 'N/A'}</td>
                      </tr>
                      {medicoSeleccionado === medico.id && (
                        <tr><td colSpan={5}>
                          <ActionPanel>
                            <button onClick={() => setModalMedico(medico)}>✏️ Editar Esp.</button>
                            <button onClick={() => eliminarMedico(medico.id)}>🗑 Eliminar</button>
                          </ActionPanel>
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </UserTable>
            </>
          )}

          {activeSection === 'medicamentos' && (
            <>
              <h2>Lista de Medicamentos</h2>
              <AddButton onClick={handleAbrirModalNuevoMedicamento}>
                + Añadir Medicamento
              </AddButton>
              <UserTable>
                <thead>
                  <tr><th>ID</th><th>Nombre</th></tr>
                </thead>
                <tbody>
                  {[...medicamentos]
                    .sort((a, b) => a.id - b.id)
                    .map((medicamento) => (
                    <React.Fragment key={medicamento.id}>
                      <tr onClick={() => toggleMedicamento(medicamento.id)} style={{cursor: 'pointer'}}>
                        <td>{medicamento.id}</td>
                        <td>{medicamento.nombre}</td>
                      </tr>
                      {medicamentoSeleccionado === medicamento.id && (
                        <tr><td colSpan={3}>
                          <ActionPanel>
                            <button onClick={() => setModalMedicamento(medicamento)}>✏️ Editar</button>
                            <button onClick={() => eliminarMedicamento(medicamento.id)}>🗑 Eliminar</button>
                          </ActionPanel>
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </UserTable>
            </>
          )}

          {activeSection === 'citas' && (
            <>
              <h2>Lista de Citas</h2>
              <UserTable>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha y Hora</th>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {[...citas]
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                    .map((cita) => (
                    <React.Fragment key={cita.id}>
                      <tr onClick={() => toggleCita(cita.id)} style={{cursor: 'pointer'}}>
                        <td>{cita.id}</td>
                        <td>{formatDateTime(cita.fecha)}</td>
                        <td>{cita.pacienteNombre || `ID Pac: ${cita.usuarioId}`}</td>
                        <td>{cita.medicoNombre || `ID Med: ${cita.medicoId}`}</td>
                        <td>{cita.motivoConsulta}</td>
                        <td>{cita.estado}</td>
                      </tr>
                      {citaSeleccionada === cita.id && (
                        <tr><td colSpan={6}>
                          <ActionPanel>
                            <button onClick={() => {
                                const citaParaModal = {
                                    ...cita,
                                    fecha: cita.fecha,
                                    usuarioId: cita.usuarioId,
                                    medicoId: cita.medicoId,
                                    motivoConsulta: cita.motivoConsulta,
                                    estado: cita.estado
                                };
                                setModalCita(citaParaModal);
                            }}>✏️ Editar</button>
                            <button onClick={() => eliminarCita(cita.id)}>🗑 Eliminar</button>
                          </ActionPanel>
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </UserTable>
            </>
          )}

        </MainContent>
      </Wrapper>

      {modalUsuario && (
        <ModalOverlay onClick={() => setModalUsuario(null)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <h3>Editar Usuario</h3>
            <label>Nombre:</label>
            <input value={modalUsuario.nombre} onChange={(e) => setModalUsuario({ ...modalUsuario, nombre: e.target.value })} />
            <label>Email:</label>
            <input value={modalUsuario.email} onChange={(e) => setModalUsuario({ ...modalUsuario, email: e.target.value })} />
            <label>Rol:</label>
            <select value={modalUsuario.rol} onChange={(e) => setModalUsuario({ ...modalUsuario, rol: e.target.value as Usuario['rol'] })}>
              <option value="PACIENTE">Paciente</option>
              <option value="MEDICO">Médico</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <ModalButtons>
              <button onClick={guardarCambiosUsuario}>Guardar</button>
              <button onClick={() => setModalUsuario(null)}>Cancelar</button>
            </ModalButtons>
          </ModalContainer>
        </ModalOverlay>
      )}

      {modalMedico && (
        <ModalOverlay onClick={() => setModalMedico(null)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <h3>Editar Especialidad del Médico</h3>
            <p>Médico: {modalMedico.nombre}</p>
            <label>Especialidad:</label>
            <select
              value={modalMedico.especialidadId}
              onChange={(e) => setModalMedico({ ...modalMedico, especialidadId: Number(e.target.value) })}
            >
              {especialidades.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
            <ModalButtons>
              <button onClick={guardarCambiosMedico}>Guardar</button>
              <button onClick={() => setModalMedico(null)}>Cancelar</button>
            </ModalButtons>
          </ModalContainer>
        </ModalOverlay>
      )}

      {modalMedicamento && (
        <ModalOverlay onClick={() => setModalMedicamento(null)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <h3>{modalMedicamento.id && modalMedicamento.id !== 0 ? 'Editar' : 'Añadir'} Medicamento</h3>
            <label>Nombre:</label>
            <input
              value={modalMedicamento.nombre || ''}
              onChange={(e) => setModalMedicamento(prev => ({ ...prev, nombre: e.target.value }))}
            />
            <ModalButtons>
              <button onClick={guardarCambiosMedicamento}>Guardar</button>
              <button onClick={() => setModalMedicamento(null)}>Cancelar</button>
            </ModalButtons>
          </ModalContainer>
        </ModalOverlay>
      )}

      {modalCita && modalCita.id && (
        <ModalOverlay onClick={() => setModalCita(null)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <h3>Editar Cita ID: {modalCita.id}</h3>

            <label>Fecha y Hora:</label>
            <input
              type="datetime-local"
              value={modalCita.fecha ? modalCita.fecha.substring(0, 16) : ''}
              onChange={(e) => setModalCita(prev => ({ ...prev, fecha: e.target.value }))}
            />

            <label>Paciente (Usuario):</label>
            <select
              value={modalCita.usuarioId || ''} 
              onChange={(e) => setModalCita(prev => ({ ...prev, usuarioId: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">Seleccione un paciente</option>
              {pacientesParaSelector.map(paciente => (
                <option key={paciente.id} value={paciente.id}>{paciente.nombre} (ID: {paciente.id})</option>
              ))}
            </select>

            <label>Médico:</label>
            <select
              value={modalCita.medicoId || ''} 
              onChange={(e) => setModalCita(prev => ({ ...prev, medicoId: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">Seleccione un médico</option>
              {medicosParaSelector.map(medico => (
                <option key={medico.id} value={medico.id}>{medico.nombre} (ID: {medico.id})</option>
              ))}
            </select>

            <label>Motivo de Consulta:</label>
            <textarea
              value={modalCita.motivoConsulta || ''}
              onChange={(e) => setModalCita(prev => ({ ...prev, motivoConsulta: e.target.value }))}
              rows={3}
            />

            <label>Estado:</label>
            <select
              value={modalCita.estado || 'PENDIENTE'}
              onChange={(e) => setModalCita(prev => ({ ...prev, estado: e.target.value as Cita['estado'] }))}
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>

            </select>

            <ModalButtons>
              <button onClick={guardarCambiosCita}>Guardar Cambios</button>
              <button onClick={() => setModalCita(null)}>Cancelar</button>
            </ModalButtons>
          </ModalContainer>
        </ModalOverlay>
      )}

      {popupMensaje && <Popup>{popupMensaje}</Popup>}
    </>
  );
};

export default AdminDashboard;

// --- Estilos ---
const Wrapper = styled.div`display: flex; height: 100vh;`;
const Sidebar = styled.aside`width: 240px; background: #009688; color: white; display: flex; flex-direction: column; padding: 20px; box-shadow: 2px 0 5px rgba(0,0,0,0.1); z-index: 10;`;
const Logo = styled.div`font-size: 1.5rem; font-weight: bold; margin-bottom: 30px; text-align: center; padding: 10px 0; color: #e0f2f1;`;
const MenuButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? '#00796B' : 'transparent')};
  border: none;
  color: white;
  text-align: left;
  padding: 13px 18px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s ease-in-out, transform 0.1s ease;
  &:hover {
    background: #00695C;
    transform: translateX(3px);
  }
`;
const LogoutButton = styled.button`
  margin-top: auto;
  padding: 12px;
  background: #FF5252;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  color: white;
  transition: background 0.2s ease-in-out;
  &:hover {
    background: #E53935;
  }
`;
const MainContent = styled.main`
  flex: 1;
  padding: 30px 40px;
  background: #eef2f3;
  overflow-y: auto;
  height: 100vh;
`;
const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 25px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border-radius: 8px;
  overflow: hidden;

  th, td {
    padding: 14px 18px;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
    font-size: 0.9rem;
  }
  th {
    background: #00897B;
    color: white;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  tr:last-child td {
    border-bottom: none;
  }
  tr:hover {
    background-color: #f5f5f5;
  }
  td {
    word-break: break-word;
  }
`;
const ActionPanel = styled.div`
  display: flex;
  gap: 12px;
  padding: 15px 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
  margin: 5px 0;

  button {
    padding: 9px 15px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: opacity 0.2s;
    &:hover { opacity: 0.85; }
  }
  button:nth-child(1) { background: #FFB300; color: white; }
  button:nth-child(2) { background: #00C853; color: white; }
  button:nth-child(3) { background: #F44336; color: white; }

  &:has(button:nth-child(2):last-child) button:nth-child(2) {
    background: #F44336;
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const ModalContainer = styled.div`
  background: white;
  padding: 28px 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);

  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.4rem;
    color: #333;
    text-align: center;
  }
  label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #555;
    margin-bottom: -8px;
  }
  input, select, textarea {
    padding: 10px 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    width: 100%;
  }
  textarea {
    resize: vertical;
  }
`;
const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  button:nth-child(1) {
    background: #00796B;
    color: white;
    &:hover { background: #00695C; }
  }
  button:nth-child(2) {
    background: #e0e0e0;
    color: #333;
    &:hover { background: #bdbdbd; }
  }
`;
const Popup = styled.div`
  position: fixed;
  bottom: 25px;
  right: 25px;
  background: #333;
  color: white;
  padding: 14px 22px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.25);
  z-index: 1100;
  font-size: 0.95rem;
`;