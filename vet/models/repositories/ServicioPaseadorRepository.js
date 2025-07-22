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
            const { id, ...datosActualizados } = this.serializarServicioPaseador(servicioPaseador)
            const servicioPaseadorExistente = await this.model.findByIdAndUpdate(
                id,
                datosActualizados,
                { new: true , runValidators: true }
            )
            return await this.model.populate(servicioPaseadorExistente, [
                { path: 'usuarioProveedor'}
            ])
        } else {
            const datosSerializados = this.serializarServicioPaseador(servicioPaseador)
            const nuevoServicioPaseador = new this.model(datosSerializados)
            const servicioPaseadorGuardado = await nuevoServicioPaseador.save()
            return await this.model.populate(servicioPaseadorGuardado, [
                { path: 'usuarioProveedor'},
                { 
                    path: 'direccion.ciudad',
                    populate: { path: 'localidad' }
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
        const alojamientos = await this.model.find()
            .skip(skip)
            .limit(limitNum)
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            })
        return alojamientos
    }

   async findByFilters(filtro) {
            // console.log("Filtro recibido:", filtro);

           const query = {}
   
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
                        path: 'direccion.ciudad',
                        populate: {path: 'localidad'}
                    })

              const resultadosFinal = resultadosFiltro1.filter(r => {
                  const ciudad = r.direccion?.ciudad
                  const localidad = ciudad?.localidad
                  const nombreServicio = r.nombreServicio
      
                  const coincideCiudad = filtro.ciudad ? ciudad?.nombre === filtro.ciudad : true
                  const coincideLocalidad = filtro.localidad ? localidad?.nombre === filtro.localidad : true
                  const coincideNombreServicio = filtro.nombreServicio ? nombreServicio === filtro.nombreServicio : true

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

                  return coincideCiudad && coincideLocalidad && coincideNombreServicio && disponibleEnFecha
              })
              return resultadosFinal
       }

    async findById(id) {
        const documento = await this.model.findById(id)
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            });
        
        console.log("=== Documento desde MongoDB ===");
        console.log("ID:", id);
        console.log("Documento completo:", documento);
        console.log("¿Tiene direccion?", documento && documento.direccion ? "SÍ" : "NO");
        if (documento && documento.direccion) {
            console.log("Direccion del documento:", documento.direccion);
        }
        console.log("=== Fin documento ===");
        
        return documento;
    }

    async findByPaseadorId(userPaseadorId) {
        return await this.model.find({ usuarioProveedor: userPaseadorId })
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            })
            
    }

    async findByName(nombre) {
        return await this.model.findOne({nombre})
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            })
            
    }

    async findAll() {
        return await this.model.find()
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            })
            
    }

    serializarServicioPaseador(servicioPaseador) {
        console.log("=== Serializando ServicioPaseador ===");
        console.log("ServicioPaseador original:", servicioPaseador);
        console.log("Direccion original:", servicioPaseador.direccion);
        
        const objetoSerializado = { ...servicioPaseador }
        
        // Convertir la dirección de objeto Direccion a objeto plano
        if (servicioPaseador.direccion) {
            objetoSerializado.direccion = {
                calle: servicioPaseador.direccion.calle,
                altura: servicioPaseador.direccion.altura,
                ciudad: servicioPaseador.direccion.ciudad
            }
            console.log("Direccion serializada:", objetoSerializado.direccion);
        }
        
        console.log("=== Fin serialización ===");
        return objetoSerializado
    }
}



function parseFechaDDMMYYYY(fechaStr) {
  const [dia, mes, anio] = fechaStr.split("/");
  return new Date(`${anio}-${mes}-${dia}T00:00:00`);
}
