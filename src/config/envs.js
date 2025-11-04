import dotenv from 'dotenv';

dotenv.config();

export const {
    PORT,
    MONGO_URI,
    JWT_SECRET,
    SALT_ROUNDS,
    TOKEN_EXPIRATION
} = process.env;
