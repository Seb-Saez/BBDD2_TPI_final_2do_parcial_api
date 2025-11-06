import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    descripcion: { type: String },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    marca: { type: String },
    stock: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]

}, { timestamps: true });



const Product = mongoose.model('Product', productSchema);

export default Product;