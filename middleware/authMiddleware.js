const jwt = require("jsonwebtoken");

// middleware to verify JWT and authorize user
const authenticateUser = (req, res, next) => {
    // get tokens from headers
    const authHeader = req.header("Authorization");

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({
            error: "Unauthorized: No token provided"
        });
    }

    // extract the token
    const token = authHeader.split(" ")[1];

    try{
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Decoded: ", decoded);
        // attach user info to request object
        req.user = decoded;
        console.log("rootuser: ", req.user);
        next();
    }
    catch(error){
        return res.status(403).json({
            error: "Forbidden: Invalid token"
        });
    }
};

// middleware to check user role
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                error: "Forbidden: Access denied"
            });
        }
        next();
    };
};

module.exports = { authenticateUser, authorizeRole };

