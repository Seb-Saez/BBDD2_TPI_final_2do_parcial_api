import mongoose from 'mongoose';

const productItemsSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    cantidad: { type: Number, required: true, min: 1 },
});

const cartSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    productos: [productItemsSchema],
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
