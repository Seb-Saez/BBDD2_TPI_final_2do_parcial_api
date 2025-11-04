import express from 'express';
import { connect } from './config/dbClient.js';
import { PORT } from './config/envs.js';

import usersRoutes from './routes/usersRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();

//middleware para que acepte json
app.use(express.json());

//Rutas
app.use('/users', usersRoutes);
app.use('/reviews', reviewRoutes);



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
    




