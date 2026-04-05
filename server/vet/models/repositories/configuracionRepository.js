import { ConfiguracionModel } from "../schemas/configuracionSchema.js";

export class ConfiguracionRepository {
    constructor() {
        this.model = ConfiguracionModel;
    }

    async getConfig() {
        let config = await this.model.findOne();
        if (!config) {
            config = await this.model.create({
                comisionPorcentaje: 10,
                comisionFija: 0,
            });
        }
        return config;
    }

    async updateConfig(datos) {
        let config = await this.model.findOne();
        if (!config) {
            config = await this.model.create(datos);
        } else {
            Object.assign(config, datos);
            await config.save();
        }
        return config;
    }
}
