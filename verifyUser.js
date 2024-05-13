import jwt from "jsonwebtoken";

export const verifyUser = (req, res, next) => {
    const token = req.body.access_token;
    if (!token) {
        res.status(401).json('Please login');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            res.status(401).json('Forbidden');
        }
        req.user = user;
        next();
    });

} 