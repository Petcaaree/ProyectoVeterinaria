// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatDireccion(direccion: any): string {
  if (!direccion) return '';
  if (typeof direccion === 'string') return direccion;
  const calle = direccion.calle ?? '';
  const altura = direccion.altura ?? '';
  let localidad = '';
  let ciudad = '';
  if (direccion.localidad) {
    if (typeof direccion.localidad === 'object' && direccion.localidad !== null) {
      localidad = direccion.localidad.nombre ?? direccion.localidad.nombreLocalidad ?? '';
      if (direccion.localidad.ciudad) {
        if (typeof direccion.localidad.ciudad === 'object' && direccion.localidad.ciudad !== null) {
          ciudad = direccion.localidad.ciudad.nombre ?? direccion.localidad.ciudad.nombreCiudad ?? '';
        } else {
          ciudad = direccion.localidad.ciudad;
        }
      }
    } else {
      localidad = direccion.localidad;
    }
  }
  if (!ciudad && direccion.ciudad) {
    if (typeof direccion.ciudad === 'object' && direccion.ciudad !== null) {
      ciudad = direccion.ciudad.nombre ?? direccion.ciudad.nombreCiudad ?? '';
    } else {
      ciudad = direccion.ciudad;
    }
  }
  return [calle, altura, localidad, ciudad].filter(Boolean).join(', ');
}
