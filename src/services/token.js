import jwt from 'jsonwebtoken';
import { JWT_SECRET, TOKEN_EXPIRATION } from '../config/envs.js';

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
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}
export const extractToken = (header) => {
    if (!header) return null;
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
}
