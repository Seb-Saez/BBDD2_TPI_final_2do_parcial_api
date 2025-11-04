import express from 'express';
import { connect } from './config/dbClient.js';
import { PORT } from './config/envs.js';

import usersRoutes from './routes/usersRoutes.js';

const app = express();

//middleware para que acepte json
app.use(express.json());


app.use ('/users', usersRoutes);



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
    




