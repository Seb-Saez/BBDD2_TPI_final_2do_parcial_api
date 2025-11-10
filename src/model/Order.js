import mongoose from 'mongoose';
import Product from './Product.js';


/**
 * Esquema para los productos dentro de una orden.
 * - producto: referencia al modelo Product.
 * - cantidad: cantidad de unidades del producto.
 * - subtotal: precio total por ese producto (precio unitario * cantidad).
 */

const productSchema = new mongoose.Schema({
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    nombre: { type: String },
    cantidad: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, default: 0 }
});

/**
 * Esquema para la orden.
 * - usuario: referencia al usuario que realiza la orden.
 * - productos: arreglo de productos (usando productSchema).
 * - estado: estado actual de la orden.
 * - total: suma de los subtotales de todos los productos.
 * - metodoPago: método de pago utilizado.
 * - timestamps: guarda fecha de creación y actualización.
 */
const orderSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productos: { type: [productSchema], required: true },
    estado: { type: String, enum: ['PENDIENTE', 'ENVIADO', 'ENTREGADO','CANCELADO'], default: 'PENDIENTE'},
    total: { type: Number },
    metodoPago: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
}, { timestamps: true });

/**
 * Método para calcular el subtotal de un producto.
 * Busca el producto en la base de datos y multiplica su precio por la cantidad.
 * Actualiza el campo subtotal del producto.
 * Retorna el subtotal calculado.
 */
productSchema.methods.calcularSubtotal = async function () {
    const product = await Product.findById(this.producto);
    if (!product) throw new Error('Producto no encontrado para calcular subtotal');
    this.subtotal = product.precio * this.cantidad;
    return this.subtotal;
}
productSchema.methods.getProductName = async function () {
    const product = await Product.findById(this.producto);
    if (!product) throw new Error('Producto no encontrado para obtener nombre');
    this.nombre = product.nombre;
}
 
/**
 * Método para calcular el total de la orden.
 * Llama a calcularSubtotal en cada producto y suma todos los subtotales.
 * Actualiza el campo total de la orden.
 */
orderSchema.methods.calcularTotalyNombre = async function () {
    const productosSubtotal = await Promise.all(this.productos.map(item => item.calcularSubtotal()));
    /**
     * [10, 20, 30]
     */
    /** 
     * @param {Array<Number>} productosSubtotal - Arreglo con los subtotales de cada producto.
     * @return {Number} total - Suma de todos los subtotales.
    */
    await Promise.all(this.productos.map(item => item.getProductName()));
    this.total = productosSubtotal.reduce((acc, item) => acc + item, 0);
}

/**
 * Middleware que se ejecuta antes de guardar una orden.
 * Calcula el total de la orden automáticamente antes de guardar.
 */
orderSchema.pre('save', async function () {
    await this.calcularTotalyNombre();
})
const Order = mongoose.model('Order', orderSchema);
export default Order;