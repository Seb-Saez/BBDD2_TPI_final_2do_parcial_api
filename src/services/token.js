import jwt from 'jsonwebtoken';
import { JWT_SECRET, TOKEN_EXPIRATION } from '../config/envs.js';

export const generateToken = (payload) => {
    //crea una constante token con jwt.sign
    /**
     * Genera un token JWT con el payload proporcionado.
     * @param {Object} payload - Datos a incluir en el token.
     * @return {String} token - Token JWT generado.
     */
    const token = jwt.sign(
        payload,
        JWT_SECRET,
        {
            expiresIn: TOKEN_EXPIRATION
        });
    return token;
}

export const verifyToken = (token) => {
    /**
     * Verifica la validez de un token JWT.
     * @param {String} token - Token JWT a verificar.
     * @return {Object|null} decoded - Payload decodificado si es válido, null si no lo es.
     */
    try {
        /**
         * @param {String} token - Token JWT a verificar.
         * @param {String} JWT_SECRET - Clave secreta para verificar el token.
         * @return {Object} decoded - Payload decodificado si el token es válido.
         */
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}
export const extractToken = (header) => {
    /**
     * Extrae el token JWT del encabezado de autorización.
     * @param {String} header - Encabezado de autorización.
     */
    try {
        /**
         * @param {String} header - Encabezado de autorización.
         * @return {String|null} token - Token extraído o null si no es válido para evitar un TypeError.
         */
        if (!header) return null;
        /**
         * Se usa split para dividir el encabezado en partes a partir del espacio.
         * @param {String} header - Encabezado de autorización.
         * @return {Array<String>} parts - Arreglo con las partes del encabezado. Bearer y el token.
         */
        const parts = header.split(' ');
        /**
         * Se verifica que el formato sea correcto (2 partes y la primera sea 'Bearer').
         * @param {Array<String>} parts - Arreglo con las partes del encabezado.
         * @return {String|null} token - Token extraído o null si el formato no es correcto.
         */
        if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
        return parts[1];
    } catch (error) {
        /**
         * En caso de error, retorna null para evitar un TypeError.
         */
        return null;
    }
}
