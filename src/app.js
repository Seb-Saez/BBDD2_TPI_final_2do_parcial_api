import express from 'express';
import { connect } from './config/dbClient.js';
import { PORT } from './config/envs.js';

import usersRoutes from './routes/usersRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import ordersRoutes from './routes/orderRoutes.js';

const app = express();

//middleware para que acepte json
app.use(express.json());

//Rutas
app.use('/api/users', usersRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);


(async () => {
    try {
        await connect();
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
    }
})();
    




