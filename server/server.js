import express from 'express';
import logger from './vet/utils/logger.js';

export class Server {
  #controllers = {};
  #routes = [];
  #app;

  constructor(app, port = 3000) {
    this.#app = app;
    this.port = port;
    this.#app.use(express.json());
  }

  get app() {
    return this.#app;
  }

  setController(controllerClass, controller) {
    this.#controllers[controllerClass.name] = controller;
  }

  getController(controllerClass) {
    const controller = this.#controllers[controllerClass.name];
    if(!controller) {
      throw new Error("Controller missing for the given route");
    }
    return controller;
  }

  configureRoutes() {
    this.#routes.forEach(r => {
      this.app.use(r(this.getController.bind(this)));
    })
  }

  launch() {
    this.app.listen(this.port, () => {
      logger.info(`Server running on port ${this.port}`);
      logger.info(`Documentación en http://localhost:${this.port}/api-docs`);
    });
  }

  addRoute(route) {
    this.#routes.push(route)
  }

}