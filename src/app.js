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
app.use('/users', usersRoutes);
app.use('/reviews', reviewRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productsRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/', (req, res) => {
    res.send('Welcome to the API');
});



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
    




