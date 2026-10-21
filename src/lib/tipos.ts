export type EstadoReporte = 'pendiente' | 'en_curso' | 'resuelto';

export type Categoria = 'electricidad' | 'agua' | 'mobiliario' | 'equipos';

export type UbicacionReporte = {
  latitud: number;
  longitud: number;
  aproximada: boolean;
};

export type Reporte = {
  id: string;
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: Categoria;
  estado: EstadoReporte;
  foto: string | null;
  ubicacion: UbicacionReporte | null;
  sector: string;
  creado: string;
};

export type Aviso = {
  id: string;
  reporteId: string;
  texto: string;
  fecha: string;
};

export type Borrador = {
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: Categoria;
  foto: string | null;
  ubicacion: UbicacionReporte | null;
  sector: string;
};

export const BORRADOR_VACIO: Borrador = {
  titulo: '',
  descripcion: '',
  aula: '',
  categoria: 'electricidad',
  foto: null,
  ubicacion: null,
  sector: '',
};

export const CATEGORIAS: { valor: Categoria; nombre: string }[] = [
  { valor: 'electricidad', nombre: 'Electricidad' },
  { valor: 'agua', nombre: 'Agua' },
  { valor: 'mobiliario', nombre: 'Mobiliario' },
  { valor: 'equipos', nombre: 'Equipos' },
];

export const SECTORES = ['Patio', 'Estacionamiento', 'Pasillo', 'Aula', 'Baño', 'Otro'];

export function nombreCategoria(categoria: Categoria) {
  const encontrada = CATEGORIAS.find((item) => item.valor === categoria);
  return encontrada ? encontrada.nombre : categoria;
}
