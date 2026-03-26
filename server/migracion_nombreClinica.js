// Script de migración para agregar nombreClinica a veterinarias existentes
// Ejecutar en MongoDB Compass o mongo shell

// 1. Ver veterinarias existentes
db.veterinarias.find({}, {nombreUsuario: 1, email: 1, nombreClinica: 1})

// 2. Actualizar todas las veterinarias agregando un nombreClinica por defecto
// Puedes personalizar el nombre según necesites
db.veterinarias.updateMany(
  { nombreClinica: { $exists: false } }, // Solo actualizar las que no tienen el campo
  { 
    $set: { 
      nombreClinica: "Clínica Veterinaria" // Nombre por defecto
    } 
  }
)

// 3. Si quieres nombres más específicos basados en el nombreUsuario:
db.veterinarias.find({}).forEach(function(doc) {
  if (!doc.nombreClinica) {
    db.veterinarias.updateOne(
      { _id: doc._id },
      { 
        $set: { 
          nombreClinica: "Clínica " + doc.nombreUsuario 
        } 
      }
    )
  }
})

// 4. Verificar que todas las veterinarias tengan el campo
db.veterinarias.find({ nombreClinica: { $exists: false } }).count() // Debería ser 0
