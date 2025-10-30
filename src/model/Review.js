import mongooose from 'mongoose';

const reviewSchema = new mongooose.Schema({
    usuario: { type: mongooose.Schema.Types.ObjectId, ref: 'User', required: true },
    producto: { type: mongooose.Schema.Types.ObjectId, ref: 'Product', required: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String }
}, { timestamps: true });


const Review = mongooose.model('Review', reviewSchema);

export default Review;