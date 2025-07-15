import path from 'path';
import { ServicioCuidadorModel } from '../schemas/alojamientoSchema.js';

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
                    path: 'direccion.ciudad',
                    populate: { path: 'localidad' }
                }
            ])
        } else {
            const nuevoServicioCuidador = new this.model(servicioCuidador)
            const servicioCuidadorGuardado = await nuevoServicioCuidador.save()
            return await this.model.populate(servicioCuidadorGuardado, [
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
            query.precioPorNoche = {}
            query.precioPorNoche.$lte = filtro.precioMax
        }
        
        if(filtro.precioMin != null) {
            query.precioPorNoche.$gte = filtro.precioMin
        }

        if(filtro.cantHuespedes != null) {
            query.cantHuespedesMax = { $gte: filtro.cantHuespedes}
        }

        if(filtro.caracteristicas && filtro.caracteristicas.length > 0) {
            query.caracteristicas = { $all: filtro.caracteristicas }
        }

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
            .populate('anfitrion')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'pais'}
            })

        return resultadosFiltro1.filter(r => {
            const ciudad = r.direccion?.ciudad
            const pais = ciudad?.pais

            const coincideCiudad = filtro.ciudad ? ciudad?.nombre === filtro.ciudad : true
            const coincidePais = filtro.pais ? pais?.nombre === filtro.pais : true

            return coincideCiudad && coincidePais
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

    async findByAnfitrion(userCuidadorId) {
        return await this.model.find({ usuarioProveedor: userCuidadorId })
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
