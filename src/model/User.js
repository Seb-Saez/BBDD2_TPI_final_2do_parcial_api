import mongoose from 'mongoose';

const direccionesSchema = new mongoose.Schema({
    calle: { type: String, required: true },
    codigoPostal: { type: String, required: true },
    numero: { type: String, required: true }
});


const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    direccion: [direccionesSchema],
    telefono: { type: String, required: true },
    rol: { type: String, enum: ['CLIENT', 'ADMIN'], default: 'CLIENT' }
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

export default User;