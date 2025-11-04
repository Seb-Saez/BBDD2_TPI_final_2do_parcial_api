import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../config/envs.js';



export const hashPassword = async (password) => {
    /**
     * Genera un hash seguro para la contraseña proporcionada.
     * @param {String} password - Contraseña en texto plano.
     * 
     * Se hashea con bcrypt usando el número de rondas definido en las variables de entorno.
     * @example
     * @function await hashPassword('miContraseñaSegura');
     * @return {String} 'KkjbKJKJiu8itydcHTGC87FUYvlkVBJHVoiyuh'
     * 
     * Bycrypt aplica un algoritmo de hashing adaptativo que incluye un "salt" para proteger contra ataques de rainbow table.
     * @param {String} password - La contraseña en texto plano que se desea hashear.
     * @param {Number} SALT_ROUNDS - Número de rondas de salting para aumentar la seguridad del hash.
     * @return {String} hashedPassword - La contraseña hasheada que se puede almacenar de forma segura en la base de datos.
     */
    const hashedPassword = await bcrypt.hash(password, Number(SALT_ROUNDS));
    return hashedPassword;
}

export const comparePassword = async (password, hashedPassword) => {
    /**
     * Compara una contraseña en texto plano con su hash correspondiente.
     * Para compararla primero se debe hashear la contraseña en texto plano y luego comparar ambos hashes.
     * @example
     * @function await hashPassword(await hashedPassword('miContraseñaSegura'),[contraseña hasheada desde la db]);
     * @return {Boolean} true
     */
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}