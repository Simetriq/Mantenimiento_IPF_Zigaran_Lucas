import { createContext, useContext, useState, type ReactNode } from 'react';
import { programarAvisoResolucion } from './notificaciones';
import { BORRADOR_VACIO, type Aviso, type Borrador, type Reporte } from './tipos';

type ContextoReportes = {
  reportes: Reporte[];
  avisos: Aviso[];
  borrador: Borrador;
  avisosActivados: boolean;
  actualizarBorrador: (cambio: Partial<Borrador>) => void;
  limpiarBorrador: () => void;
  crearReporte: () => Reporte;
  simularResolucion: (id: string) => void;
  setAvisosActivados: (valor: boolean) => void;
};

const Contexto = createContext<ContextoReportes | null>(null);

export function ReportesProvider({ children }: { children: ReactNode }) {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [borrador, setBorrador] = useState<Borrador>(BORRADOR_VACIO);
  const [avisosActivados, setAvisosActivados] = useState(false);

  function actualizarBorrador(cambio: Partial<Borrador>) {
    setBorrador((anterior) => ({ ...anterior, ...cambio }));
  }

  function limpiarBorrador() {
    setBorrador(BORRADOR_VACIO);
  }

  function crearReporte() {
    const nuevo: Reporte = {
      id: String(Date.now()),
      titulo: borrador.titulo.trim(),
      descripcion: borrador.descripcion.trim(),
      aula: borrador.aula.trim(),
      categoria: borrador.categoria,
      estado: 'pendiente',
      foto: borrador.foto,
      ubicacion: borrador.ubicacion,
      sector: borrador.sector,
      creado: new Date().toLocaleString('es-AR'),
    };

    setReportes((anteriores) => [nuevo, ...anteriores]);
    setBorrador(BORRADOR_VACIO);
    return nuevo;
  }

  function simularResolucion(id: string) {
    const reporte = reportes.find((item) => item.id === id);
    if (!reporte || reporte.estado !== 'pendiente') return;

    setReportes((anteriores) =>
      anteriores.map((item) => (item.id === id ? { ...item, estado: 'en_curso' } : item))
    );

    setTimeout(() => {
      setReportes((anteriores) =>
        anteriores.map((item) => (item.id === id ? { ...item, estado: 'resuelto' } : item))
      );

      setAvisos((anteriores) => [
        {
          id: String(Date.now()),
          reporteId: id,
          texto: `Tu reporte "${reporte.titulo}" ya está resuelto.`,
          fecha: new Date().toLocaleString('es-AR'),
        },
        ...anteriores,
      ]);

      if (avisosActivados) {
        void programarAvisoResolucion(reporte.titulo);
      }
    }, 10000);
  }

  return (
    <Contexto.Provider
      value={{
        reportes,
        avisos,
        borrador,
        avisosActivados,
        actualizarBorrador,
        limpiarBorrador,
        crearReporte,
        simularResolucion,
        setAvisosActivados,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useReportes() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('useReportes se tiene que usar dentro de ReportesProvider');
  }
  return contexto;
}
