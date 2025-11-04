import jwt from 'jsonwebtoken';
import { JWT_SECRET, TOKEN_EXPIRATION } from '../config/envs';

export const generateToken = (payload) => {
    const token = jwt.sign(
        payload, 
        JWT_SECRET, 
        { 
            expiresIn: TOKEN_EXPIRATION 
        });
    return token;
}

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return `Error verifying token: ${error.message}`;
    }
}