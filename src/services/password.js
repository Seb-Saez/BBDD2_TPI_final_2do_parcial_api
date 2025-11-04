import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../config/envs.js';

export const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, Number(SALT_ROUNDS));
    return hashedPassword;
}

export const comparePassword = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}