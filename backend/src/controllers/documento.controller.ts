// documento.controller.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma'; // Asegúrate que la ruta a tu cliente Prisma sea correcta

// Crear documento con medicamentos recetados
export const crearDocumento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { citaId, observaciones, medicamentos } = req.body;

    if (!citaId || typeof citaId !== 'number') {
      res.status(400).json({ error: 'citaId es obligatorio y debe ser un número' });
      return;
    }

    if (typeof observaciones !== 'string' || observaciones.trim() === '') {
       res.status(400).json({ error: 'observaciones es obligatorio y debe ser un texto no vacío' });
       return;
    }

    if (!Array.isArray(medicamentos)) {
      res.status(400).json({ error: 'medicamentos debe ser un array' });
      return;
    }

    const cita = await prisma.cita.findUnique({
      where: { id: citaId },
      include: { documento: true }
    });

    if (!cita) {
      res.status(404).json({ error: 'Cita no encontrada' });
      return;
    }

    if (cita.documento) { // Asumiendo que citaId en Documento es @unique (relación uno a uno)
         res.status(400).json({ error: 'Ya existe un documento para esta cita' });
         return;
    }

    const documento = await prisma.documento.create({
      data: {
        citaId,
        observaciones: observaciones,
      }
    });

    const recetasValidas = medicamentos.filter((m: any) =>
      m.medicamentoId && typeof m.medicamentoId === 'number' &&
      m.dosis && typeof m.dosis === 'string' &&
      m.frecuencia && typeof m.frecuencia === 'string' &&
      m.duracion && typeof m.duracion === 'string'
    );

    if (recetasValidas.length > 0) {
      await prisma.medicamentoRecetado.createMany({
        data: recetasValidas.map((m: any) => ({
          documentoId: documento.id,
          medicamentoId: m.medicamentoId,
          dosis: m.dosis,
          frecuencia: m.frecuencia,
          duracion: m.duracion
        }))
      });
    }

    await prisma.cita.update({
      where: { id: citaId },
      data: { estado: 'COMPLETADA' }
    });

    res.status(201).json({ documentoId: documento.id, message: "Documento y recetas creados exitosamente" });
  } catch (error) {
    console.error('❌ Error al crear documento:', error);
    res.status(500).json({ error: 'Error interno al guardar el documento' });
  }
};

// Obtener documentos por usuario
export const getDocumentosPorUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioIdString = req.headers['usuarioid'] as string;
    if (!usuarioIdString) {
        res.status(400).json({ error: 'Falta el encabezado del ID del usuario (usuarioid)' });
        return;
    }
    const usuarioId = parseInt(usuarioIdString);

    if (isNaN(usuarioId)) {
      res.status(400).json({ error: 'El ID del usuario (usuarioid) es inválido' });
      return;
    }

    const documentosFromDb = await prisma.documento.findMany({
      where: {
        cita: {
            usuarioId: usuarioId
        }
      },
      orderBy: {
        cita: {
            fecha: 'desc'
        }
      },
      include: {
        cita: {
          select: {
            fecha: true,
            medico: {
                select: { nombre: true }
            }
          }
        },
        medicamentosRecetados: {
          include: {
            medicamento: {
              select: { nombre: true }
            }
          }
        }
      }
    });

    const documentosParaFrontend = documentosFromDb.map(doc => {
      let medicamentosString = null;
      if (doc.medicamentosRecetados && Array.isArray(doc.medicamentosRecetados) && doc.medicamentosRecetados.length > 0) {
        medicamentosString = doc.medicamentosRecetados
          .map(mr => {
            const nombreMed = mr.medicamento?.nombre || 'Medicamento desconocido';
            const dosis = mr.dosis || 'N/A';
            const frecuencia = mr.frecuencia || 'N/A';
            const duracion = mr.duracion || 'N/A';
            return `${nombreMed} (Dosis: ${dosis}, Frecuencia: ${frecuencia}, Duración: ${duracion})`;
          })
          .join('; ');
      }

      return {
        id: doc.id,
        observaciones: doc.observaciones,
        cita: doc.cita,
        medicamentos: medicamentosString,
      };
    });

    res.status(200).json(documentosParaFrontend);
  } catch (error) {
    console.error('❌ Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

// Obtener lista de medicamentos disponibles
export const getMedicamentos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const medicamentos = await prisma.medicamento.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.status(200).json(medicamentos);
  } catch (error) {
    console.error('❌ Error al obtener medicamentos:', error);
    res.status(500).json({ error: 'Error al obtener medicamentos' });
  }
};