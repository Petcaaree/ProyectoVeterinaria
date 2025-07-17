import { ServicioVeterinariaModel } from '../schemas/alojamientoSchema.js';

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
                    path: 'direccion.ciudad',
                    populate: { path: 'localidad' }
                }
            ])
        } else {
            const nuevoServicioVeterinaria = new this.model(servicioVeterinaria)
            const servicioVeterinariaGuardado = await nuevoServicioVeterinaria.save()
            return await this.model.populate(servicioVeterinariaGuardado, [
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
              
              const query = {}
      
              if(filtro.precioMax != null) {
                  query.precio = {}
                  query.precio.$lte = filtro.precioMax
              }
              
              if(filtro.precioMin != null) {
                  query.precio.$gte = filtro.precioMin
              }
      
              /* if(filtro.antiguedad != null) {
                  query.cantHuespedesMax = { $gte: filtro.antiguedad}
              } */
      
              if(filtro.mascotasAceptadas && filtro.mascotasAceptadas.length > 0) {
                  query.mascotasAceptadas = { $all: filtro.mascotasAceptadas }
              }
      
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
                  .populate({
                      path: 'direccion.ciudad',
                      populate: {path: 'localidad'}
                  })
      
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
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            })
    }

    async findByAnfitrion(userVeterinariaId) {
        return await this.model.find({ usuarioProveedor: userVeterinariaId })
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
}

function parseFechaDDMMYYYY(fechaStr) {
  const [dia, mes, anio] = fechaStr.split("/");
  return new Date(`${anio}-${mes}-${dia}T00:00:00`);
}
