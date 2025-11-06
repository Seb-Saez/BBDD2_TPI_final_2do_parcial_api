import { verifyHeaderTokenAndVerify } from "../services/token";

export const authenticate = (req, res, next) => {
    try {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).send("access denied");
        const extractedToken = verifyHeaderTokenAndVerify(header);
        if (!extractedToken) return res.status(401).send("access denied");
        req.user = extractedToken;
        next();
    } catch (error) {
        res.status(500).send(`Error authenticating user: ${error.message}`);
    }
}