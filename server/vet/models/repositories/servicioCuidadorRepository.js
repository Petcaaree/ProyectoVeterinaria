import path from 'path';
import { ServicioCuidadorModel } from '../schemas/servicioCuidadorSchema.js';

export class ServicioCuidadorRepository {
    constructor() {
        this.model = ServicioCuidadorModel
    }

    async countAll() {
        return await this.model.countDocuments()
    }

    async save(servicioCuidador) {
        if(servicioCuidador.id) {
            const { id, ...datosActualizados } = servicioCuidador
            const servicioCuidadorExistente = await this.model.findByIdAndUpdate(
                id,
                datosActualizados,
                { new: true , runValidators: true }
            )
            return await this.model.populate(servicioCuidadorExistente, [
                { path: 'usuarioProveedor'},
                { 
                    path: 'direccion.localidad',
                    populate: { path: 'ciudad' }
                }
                
            ])
        } else {
            const nuevoServicioCuidador = new this.model(servicioCuidador)
            const servicioCuidadorGuardado = await nuevoServicioCuidador.save()
            return await this.model.populate(servicioCuidadorGuardado, [
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
        const servicioCuidador = await this.model.find({ estado: "Activada" })
            .skip(skip)
            .limit(limitNum)
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
            
        return servicioCuidador
    }

   async findByFilters(filtro) {
              
              const query = { estado: "Activada" }  // Siempre filtrar por estado Activada
      
              if(filtro.precioMax != null) {
                  query.precio = {}
                  query.precio.$lte = filtro.precioMax
              }
              
              if(filtro.precioMin != null) {
                  if(!query.precio) query.precio = {}
                  query.precio.$gte = filtro.precioMin
              }

              if(filtro.mascotasAceptadas && filtro.mascotasAceptadas.length > 0) {
                  query.mascotasAceptadas = { $all: filtro.mascotasAceptadas }
              }
      
              /* if(filtro.antiguedad != null) {
                  query.cantHuespedesMax = { $gte: filtro.antiguedad}
              } */
      
              
      
              if (filtro.fechaInicio && filtro.fechaFin) {
                  const fechaInicioDate = parseFechaDDMMYYYY(filtro.fechaInicio);
                  const fechaFinDate = parseFechaDDMMYYYY(filtro.fechaFin);
      
                  query.fechasNoDisponibles = {
                      $not: {
                          $elemMatch: {
                              fechaInicio: { $lte: fechaFinDate },
                              fechaFin: { $gte: fechaInicioDate }
                          }
                      }
                  };
              }
      
      
              const resultadosFiltro1 = await this.model.find(query)
                  .populate('usuarioProveedor')
                  .populate({
                    path: 'direccion.localidad',
                    populate: { path: 'ciudad' }
                    });

             
              return resultadosFiltro1.filter(r => {
                  const localidad = r.direccion?.localidad
                  const ciudad = r.direccion?.localidad?.ciudad
                  const nombreServicio = r.nombreServicio
      
                  const coincideLocalidad = filtro.localidad ? ciudad?.nombre === filtro.localidad : true
                  const coincideNombreServicio = filtro.nombreServicio ? nombreServicio === filtro.nombreServicio : true

      
                  return coincideLocalidad && coincideNombreServicio
              })
      
          }

    async findById(id) {
        return await this.model.findById(id)
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
            
    }

    async findByCuidadorId(cuidadorID) {
        return await this.model.find({ usuarioProveedor: cuidadorID })
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
            
    }

    async findByName(nombre) {
        return await this.model.findOne({nombre : nombreServicio})
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
            
    }

    async findAll() {
        return await this.model.find({ estado: "Activada" })
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.localidad',
                populate: {path: 'ciudad'}
            })
            
    }


    async findByEstadoByCuidador(estado, cuidadorID) {
        return await this.model.find({ estado: estado, usuarioProveedor: cuidadorID })
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
