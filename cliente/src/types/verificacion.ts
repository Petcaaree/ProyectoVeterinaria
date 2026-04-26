export type TipoEstablecimiento = 'CLINICA' | 'HOSPITAL' | 'CONSULTORIO_PRIVADO';

export type EstadoVerificacion = 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO' | 'NO_INICIADA';

export type TipoDocumento =
  | 'HABILITACION_MUNICIPAL'
  | 'FOTO_FRENTE'
  | 'FOTO_INTERIOR'
  | 'COMPROBANTE_DOMICILIO'
  | 'CONSTANCIA_FISCAL';

export interface DocumentoVerificacion {
  tipo: TipoDocumento;
  url: string;
  fechaSubida?: string;
}

export interface DireccionEstablecimiento {
  calle: string;
  numero: string;
  piso?: string | null;
  depto?: string | null;
  localidad: string;
  provincia: string;
  codigoPostal: string;
}

export interface PayloadVerificacion {
  tipoEstablecimiento: TipoEstablecimiento;
  razonSocial?: string | null;
  cuit: string;
  matriculaProfesional: string;
  direccion: DireccionEstablecimiento;
  telefono: string;
  documentos: DocumentoVerificacion[];
}

export interface VerificacionResponse extends PayloadVerificacion {
  estadoVerificacion: EstadoVerificacion;
  motivoRechazo: string | null;
  fechaActualizacion?: string;
}

export interface EstadoVerificacionResponse {
  estadoVerificacion: EstadoVerificacion;
  motivoRechazo: string | null;
  // Campos opcionales si hay verificación
  tipoEstablecimiento?: TipoEstablecimiento;
  razonSocial?: string | null;
  cuit?: string;
  matriculaProfesional?: string;
  direccion?: DireccionEstablecimiento;
  telefono?: string;
  documentos?: DocumentoVerificacion[];
  fechaActualizacion?: string;
}

// Labels UI para cada tipo de documento
export const TIPO_DOCUMENTO_LABEL: Record<TipoDocumento, string> = {
  HABILITACION_MUNICIPAL: 'Habilitación Municipal',
  FOTO_FRENTE: 'Foto del frente del local',
  FOTO_INTERIOR: 'Foto del espacio de atención',
  COMPROBANTE_DOMICILIO: 'Comprobante de domicilio',
  CONSTANCIA_FISCAL: 'Constancia fiscal / Monotributo',
};

// Especificaciones detalladas para mostrar en tooltip (qué tiene que tener el documento).
export const TIPO_DOCUMENTO_INFO: Record<TipoDocumento, string> = {
  HABILITACION_MUNICIPAL: 'Documento (PDF o foto) emitido por la municipalidad que autoriza el funcionamiento del establecimiento en el rubro veterinario. Tiene que ser legible, con sello y vigente.',
  FOTO_FRENTE: 'Imagen clara y diurna del frente del local. Debe verse el cartel y la numeración de la calle, demostrando la existencia física del establecimiento.',
  FOTO_INTERIOR: 'Imágenes del espacio donde atendés a las mascotas. Podés subir varias fotos mostrando distintos sectores (sala de espera, consultorio, quirófano, etc.).',
  COMPROBANTE_DOMICILIO: 'Factura de servicio (luz, gas, internet) a tu nombre o contrato de alquiler. La dirección debe coincidir con la del establecimiento.',
  CONSTANCIA_FISCAL: 'Constancia de inscripción en AFIP (Monotributo o Responsable Inscripto) con actividad declarada en el rubro veterinario.',
};

// Tipos que admiten múltiples archivos (ej. varias fotos del consultorio).
export const TIPOS_DOCUMENTO_MULTIPLE: TipoDocumento[] = ['FOTO_INTERIOR'];

export const MAX_DOCUMENTOS_POR_TIPO_MULTIPLE = 5;

export const TIPO_ESTABLECIMIENTO_LABEL: Record<TipoEstablecimiento, string> = {
  CLINICA: 'Clínica Veterinaria',
  HOSPITAL: 'Hospital Veterinario',
  CONSULTORIO_PRIVADO: 'Consultorio Privado',
};

export const DOCS_REQUERIDOS_POR_TIPO: Record<TipoEstablecimiento, TipoDocumento[]> = {
  CLINICA: ['HABILITACION_MUNICIPAL', 'FOTO_FRENTE', 'FOTO_INTERIOR'],
  HOSPITAL: ['HABILITACION_MUNICIPAL', 'FOTO_FRENTE', 'FOTO_INTERIOR'],
  CONSULTORIO_PRIVADO: ['FOTO_INTERIOR', 'COMPROBANTE_DOMICILIO', 'CONSTANCIA_FISCAL'],
};

export const TIPOS_ENTIDAD_COMERCIAL: TipoEstablecimiento[] = ['CLINICA', 'HOSPITAL'];
