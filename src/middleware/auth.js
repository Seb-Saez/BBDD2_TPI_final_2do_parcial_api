import { verifyHeaderTokenAndVerify } from "../services/token.js";

/**
 * Middleware para autenticar usuarios mediante tokens JWT.
 * Verifica la presencia y validez del token en el encabezado de autorización.
 * Si el token es válido, adjunta la información del usuario al objeto de solicitud.
 * Si no es válido o está ausente, responde con un error 401 (No autorizado).
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */

export const authenticate = (req, res, next) => {
    try {
        //Obtener token
        const header = req.headers['authorization'];
        //Si no existe el header de autorizacion
        if (!header) return res.status(401).send("access denied");
        //Extraer token
        const extractedToken = verifyHeaderTokenAndVerify(header);
        //Si no es valido el token
        if (!extractedToken) return res.status(401).send("access denied");
        //Adjuntar info del usuario a la solicitud
        req.user = extractedToken;
        //Pasar al siguiente middleware
        next();
    } catch (error) {
        res.status(500).send(`Error authenticating user: ${error.message}`);
    }
}

/**
 * CheckAlredyLoggedIn
 * Middleware para verificar si un usuario ya ha iniciado sesión.
 * Revisa el encabezado de autorización para un token JWT válido.
 * Si el token es válido, responde con un mensaje indicando que el usuario ya ha iniciado sesión.
 * Si no hay token o no es válido, llama a next() para continuar con la solicitud.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
export const checkAlredyLoggedIn = (req, res, next) => {
    try {
        //Obtener token
        const header = req.headers['authorization'];
        //Si existe el header de autorizacion
        if (header) {
            //Extraer y verificar token
            const extractedToken = verifyHeaderTokenAndVerify(header);
            if (extractedToken) {
                return res.status(200).send("Already logged in");
            }
        }
        next();
    } catch (error) {
        res.status(500).send(`Error checking login status: ${error.message}`);
    }
}

/**
 * AdminAuthenticate
 * Middleware para autenticar usuarios administradores mediante tokens JWT.
 * Verifica la presencia y validez del token en el encabezado de autorización.
 * Además, verifica que el rol del usuario sea 'ADMIN'.
 * Si el token es válido y el usuario es administrador, adjunta la información del usuario al objeto de solicitud.
 * Si no es válido, está ausente o el usuario no es administrador, responde con un error 401 (No autorizado) o 403 (Prohibido).
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */

export const adminAuthenticate = (req, res, next) => {
    try {
        //Obtener token
        const header = req.headers['authorization'];
        //Si no existe el header de autorizacion
        if (!header) return res.status(401).send("access denied");
        //Extraer token
        const extractedToken = verifyHeaderTokenAndVerify(header);
        //Si no es valido el token
        if (!extractedToken) return res.status(401).send("access denied");
        //Verificar Administrador
        if (extractedToken.rol !== 'ADMIN') return res.status(403).send("admin access only");
        //Adjuntar info del usuario a la solicitud
        req.user = extractedToken;
        //Pasar al siguiente middleware
        next();
    } catch (error) {
        res.status(500).send(`Error authenticating admin user: ${error.message}`);
    }
}