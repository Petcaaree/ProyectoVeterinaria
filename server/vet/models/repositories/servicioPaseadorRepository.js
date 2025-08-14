import path from 'path';
import { ServicioPaseadorModel } from '../schemas/servicioPaseadorSchema.js';

export class ServicioPaseadorRepository {
    constructor() {
        this.model = ServicioPaseadorModel
    }

    async countAll() {
        return await this.model.countDocuments()
    }

    async save(servicioPaseador) {
        if(servicioPaseador.id) {
            
            const { id, ...datosActualizados } = servicioPaseador
            
            const servicioPaseadorExistente = await this.model.findByIdAndUpdate(
                id,
                datosActualizados,
                { new: true , runValidators: true }
            )
            
            return await this.model.populate(servicioPaseadorExistente, [
                { path: 'usuarioProveedor'},
                { 
                    path: 'direccion.localidad',
                    populate: { path: 'ciudad' }
                }
            ])
        } else {
            const nuevoServicioPaseador = new this.model(servicioPaseador)
            const servicioPaseadorGuardado = await nuevoServicioPaseador.save()
            return await this.model.populate(servicioPaseadorGuardado, [
                { path: 'usuarioProveedor'},
                { 
                    path: 'direccion.localidad',
                    populate: { path: 'ciudad' }
                }
            ])
        }

    }

    async deleteById(id) {
        const resultado = await this.model.findByIdAndDelete(id)
        return resultado !== null
    }


    async findByPage(pageNum, limitNum){
        const skip = (pageNum - 1) * limitNum
        const alojamientos = await this.model.find({ estado: "Activada" })
            .skip(skip)
            .limit(limitNum)
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
        return alojamientos
    }

   async findByFilters(filtro) {
            // console.log("Filtro recibido:", filtro);

           const query = { estado: "Activada" }  // Siempre filtrar por estado Activada
   
           if(filtro.precioMax != null) {
                  query.precio = {}
                  query.precio.$lte = filtro.precioMax
              }
              
              if(filtro.precioMin != null) {
                  if(!query.precio) query.precio = {}
                  query.precio.$gte = filtro.precioMin
              }
   
           /* if(filtro.antiguedad != null) {
               query.cantHuespedesMax = { $gte: filtro.antiguedad}
           } */

               // FALTARIA VER QUE POR CADA PASEO HAY UN CUPO DE ANIMALES
   
   
           let fechaFiltro = null;
              if (filtro.fecha) {
                  fechaFiltro = filtro.fecha
              }

              const resultadosFiltro1 = await this.model.find(query)
                  .populate('usuarioProveedor')
                  .populate({
                        path: 'direccion.localidad',
                        populate: {path: 'ciudad'}
                    })

              const resultadosFinal = resultadosFiltro1.filter(r => {
                  const localidad = r.direccion?.localidad
                  const ciudad = r.direccion?.localidad?.ciudad
                  const nombreServicio = r.nombreServicio
      
                  console.log('Comparando localidades en paseadores:', {
                      filtroLocalidad: filtro.localidad,
                      servicioLocalidad: localidad?.nombre,
                      servicioCiudad: ciudad?.nombre,
                      coincideConLocalidad: filtro.localidad ? localidad?.nombre === filtro.localidad : true,
                      coincideConCiudad: filtro.localidad ? ciudad?.nombre === filtro.localidad : true
                  });
      
                  // Cambiar para comparar con ciudad en lugar de localidad
                  const coincideLocalidad = filtro.localidad ? ciudad?.nombre === filtro.localidad : true
                  const coincideNombreServicio = filtro.nombre
                  ? (nombreServicio || '').toLowerCase().includes(filtro.nombre.toLowerCase())
                  : true;
                  // Filtrar por fecha: verificar si TODOS los horarios disponibles están ocupados
                  let disponibleEnFecha = true;
                  
                  if (fechaFiltro) {
                      // Si fechasNoDisponibles está vacío o no existe, el servicio está disponible
                      if (!r.fechasNoDisponibles || !Array.isArray(r.fechasNoDisponibles) || r.fechasNoDisponibles.length === 0) {
                          disponibleEnFecha = true;
                      } else {
                          // Buscar la fecha específica
                          const fechaNoDisponible = r.fechasNoDisponibles.find(f => {
                              if (f && f.fecha) {
                                  // Convertir fechaFiltro a Date si es string
                                  let fechaBuscada = fechaFiltro;
                                  if (typeof fechaFiltro === 'string') {
                                      const [dia, mes, anio] = fechaFiltro.split('/');
                                      fechaBuscada = new Date(`${anio}-${mes}-${dia}`);
                                  }
                                  
                                  // Convertir fecha del documento si es string
                                  let fechaDoc = f.fecha;
                                  if (typeof f.fecha === 'string') {
                                      if (f.fecha.includes('/')) {
                                          const [dia, mes, anio] = f.fecha.split('/');
                                          fechaDoc = new Date(`${anio}-${mes}-${dia}`);
                                      } else {
                                          fechaDoc = new Date(f.fecha);
                                      }
                                  }
                                  
                                  const fechaDocStr = fechaDoc.toDateString();
                                  const fechaBuscadaStr = fechaBuscada.toDateString();
                                  
                                  return fechaDocStr === fechaBuscadaStr;
                              }
                              return false;
                          });
                          
                          if (fechaNoDisponible) {
                              // Si encontramos la fecha, verificar horarios ocupados
                              let horariosOcupados = [];
                              if (fechaNoDisponible.horariosNoDisponibles) {
                                  horariosOcupados = fechaNoDisponible.horariosNoDisponibles.map(h => {
                                      // Manejar tanto strings como objetos {horario: "XX:XX"}
                                      return typeof h === 'string' ? h : h.horario;
                                  }).filter(h => h); // Filtrar valores undefined/null
                              }
                              
                              if (r.horariosDisponibles && Array.isArray(r.horariosDisponibles) && horariosOcupados.length > 0) {
                                  const todosOcupados = r.horariosDisponibles.every(horario => 
                                      horariosOcupados.includes(horario)
                                  );
                                  disponibleEnFecha = !todosOcupados;
                              } else {
                                  // Si no hay horarios ocupados, está disponible
                                  disponibleEnFecha = true;
                              }
                          } else {
                              // Si no encontramos la fecha en fechasNoDisponibles, está disponible
                              disponibleEnFecha = true;
                          }
                      }
                  }

                  return  coincideLocalidad && coincideNombreServicio && disponibleEnFecha
              })
              return resultadosFinal
       }

    async findById(id) {
        const documento = await this.model.findById(id)
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            });
        
        
        return documento;
    }

    async findByPaseadorId(userPaseadorId) {
        return await this.model.find({ usuarioProveedor: userPaseadorId })
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
            
    }

    async findByName(nombre) {
    return await this.model.findOne({ nombreServicio: nombre })
        .populate('usuarioProveedor')
        .populate({
            path: 'direccion.localidad',
            populate: { path: 'ciudad' }
        });
}

    async findAll() {
        return await this.model.find({ estado: "Activada" })
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
            
    }

    async findByEstadoByPaseador(estado, paseadorId) {
            return await this.model.find({ estado: estado, usuarioProveedor: paseadorId })
                .populate('usuarioProveedor')
                .populate({
                    path: 'direccion.localidad',
                    populate: { path: 'ciudad' }
                });
        }


}



function parseFechaDDMMYYYY(fechaStr) {
  const [dia, mes, anio] = fechaStr.split("/");
  return new Date(`${anio}-${mes}-${dia}T00:00:00`);
}
