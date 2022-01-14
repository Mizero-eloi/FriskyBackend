const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
    // checking if the user has the token
    const token = req.header("x-auth-token");
    if(!token) return res.status(401).send("Access denied. No token provided");

    // Checking if the token is valid 
    try{
        const decoded = jwt.verify(token, config.get("jwtPrivateKey"))
        req.user = decoded;
        next();
    }catch(ex){ 
        res.status(400).send("Invalid token");
    }
    
}