const User = require('../models/user');
const {validateToken}=require('../services/authentication');
function checkForLogin(cookieName) {
    return (req, res, next) => {
        const tokenVal = req.cookies[cookieName];
        if (!tokenVal) {
            return next();
        }
        try {
            const currUserPaylod = validateToken(tokenVal);
            req.user = currUserPaylod;
           return next();
        } catch (error) {
           return next(error); 
        }
    };
}

module.exports=checkForLogin;