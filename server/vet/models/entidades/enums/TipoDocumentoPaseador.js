export const TipoDocumentoPaseador = {
    DNI_FRENTE: 'DNI_FRENTE',
    DNI_DORSO: 'DNI_DORSO',
    ANTECEDENTES_PENALES: 'ANTECEDENTES_PENALES',
    FOTO_PERFIL: 'FOTO_PERFIL',
    CONSTANCIA_FISCAL: 'CONSTANCIA_FISCAL',
};

// FOTO_PERFIL debe ser imagen (no PDF). El resto admite ambos.
export const TIPOS_DOCUMENTO_PASEADOR_SOLO_IMAGEN = [TipoDocumentoPaseador.FOTO_PERFIL];
