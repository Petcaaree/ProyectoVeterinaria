import { ServicioVeterinariaModel } from '../schemas/servicioVeterinariaSchema.js';

export class ServicioVeterinariaRepository {
    constructor() {
        this.model = ServicioVeterinariaModel
    }


    async countAll() {
        return await this.model.countDocuments()
    }

    async save(servicioVeterinaria) {
        if(servicioVeterinaria.id) {
            const { id, ...datosActualizados } = servicioVeterinaria
            const servicioVeterinariaExistente = await this.model.findByIdAndUpdate(
                id,
                datosActualizados,
                { new: true , runValidators: true }
            )
            return await this.model.populate(servicioVeterinariaExistente, [
                { path: 'usuarioProveedor'},
                { 
                    path: 'direccion.localidad',
                    populate: { path: 'ciudad' }
                }
            ])
        } else {
            const nuevoServicioVeterinaria = new this.model(servicioVeterinaria)
            const servicioVeterinariaGuardado = await nuevoServicioVeterinaria.save()
            return await this.model.populate(servicioVeterinariaGuardado, [
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
        const servicios = await this.model.find()
            .skip(skip)
            .limit(limitNum)
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
        return servicios;
    }

   async findByFilters(filtro) {
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
      
              if(filtro.mascotasAceptadas && filtro.mascotasAceptadas.length > 0) {
                  query.mascotasAceptadas = { $all: filtro.mascotasAceptadas }
              }
      
              // El filtro de fechas se hará después de obtener los resultados
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
                  const nombreServicio = r.nombreServicio
      
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

                  return  coincideLocalidad && coincideNombreServicio && disponibleEnFecha
              })
              
              return resultadosFinal
          }

    async findById(id) {
        return await this.model.findById(id)
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
    }

    async findByVeterinariaId(userVeterinariaId) {
        return await this.model.find({ usuarioProveedor: userVeterinariaId })
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
    }

    async findByName(nombreServicio) {
        return await this.model.findOne({nombreServicio})
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
    }

    async findAll() {
        return await this.model.find()
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
    }
}

function parseFechaDDMMYYYY(fechaStr) {
  const [dia, mes, anio] = fechaStr.split("/");
  return new Date(`${anio}-${mes}-${dia}T00:00:00`);
}
