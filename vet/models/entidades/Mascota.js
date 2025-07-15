export class Mascota{

    constructor(nombre,tipo,edad,raza,  peso, fotos, duenio){
        this.nombre = nombre;
        this.tipo = tipo; 
        this.raza = raza
        this.edad = edad; 
        this.peso = peso; // Peso en kg
        this.fotos = fotos; // URL de la foto
        this.duenio = duenio; // Referencia al dueño de la mascota
    }

}