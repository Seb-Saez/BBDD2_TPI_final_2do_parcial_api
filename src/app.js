import express from 'express';
import mongoose from 'mongoose';

const app = express();

//middleware para que acepte json
app.use(express.json());

// importamos los .env
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;




// conexion a la BBDd
mongoose.connect(MONGO_URI)
    .then(()=> console.log("Conectado a la BBDD en Mongo correctamente"))
    .catch(e => console.log("Error al conectar la BBDD" + e));

app.listen(PORT, ()=>{
    console.log("Servidor corriendo en el puerto: " + PORT);
});
    




