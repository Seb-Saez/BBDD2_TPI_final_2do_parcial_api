import mongoose from 'mongoose';


const productSchema = new mongoose.Schema({
    producto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
});

const categorySchema = new mongoose.Schema({
    nombre: {type: String, required: true, unique: true},
    descripcion: {type: String},
    productos: [productSchema]
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;