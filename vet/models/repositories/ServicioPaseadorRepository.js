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
                { path: 'usuarioProveedor'}
            ])
        } else {
            const nuevoServicioPaseador = new this.model(servicioPaseador)
            const servicioPaseadorGuardado = await nuevoServicioPaseador.save()
            return await this.model.populate(servicioPaseadorGuardado, [
                { path: 'usuarioProveedor'}
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
        return alojamientos
    }

   async findByFilters(filtro) {
                         console.log("Filtro recibido:", filtro);

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
   
   
           if (filtro.fecha) {
                  const fechaDate = parseFechaDDMMYYYY(filtro.fecha);
                  
                  // Excluir servicios que tienen esta fecha en fechasNoDisponibles
                  query.fechasNoDisponibles = {
                      $not: {
                          $elemMatch: {
                              fecha: fechaDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
                          }
                      }
                  };
              }
   
   
           const resultadosFiltro1 = await this.model.find(query)
               .populate('usuarioProveedor')
               
   
           return resultadosFiltro1.filter(r => {
               const ciudad = r.direccion?.ciudad
               const localidad = ciudad?.localidad
               const nombreServicio = r.nombreServicio
   
               const coincideCiudad = filtro.ciudad ? ciudad?.nombre === filtro.ciudad : true
               const coincideLocalidad = filtro.localidad ? pais?.nombre === filtro.localidad : true
                const coincideNombreServicio = filtro.nombre ? nombreServicio === filtro.nombreServicio : true

   
               return coincideCiudad && coincideLocalidad && coincideNombreServicio
           })
   
       }

    async findById(id) {
        return await this.model.findById(id)
            .populate('usuarioProveedor')
            
    }

    async findByPaseadorId(userPaseadorId) {
        return await this.model.find({ usuarioProveedor: userPaseadorId })
            .populate('usuarioProveedor')
            
    }

    async findByName(nombre) {
        return await this.model.findOne({nombre})
            .populate('usuarioProveedor')
            
    }

    async findAll() {
        return await this.model.find()
            .populate('usuarioProveedor')
            
    }
}



function parseFechaDDMMYYYY(fechaStr) {
  const [dia, mes, anio] = fechaStr.split("/");
  return new Date(`${anio}-${mes}-${dia}T00:00:00`);
}
