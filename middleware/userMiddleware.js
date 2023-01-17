const User = require("../models/User");
const bigPromise = require("../middleware/bigPromise.js");
const CustomError = require("../utils/CustomError");
const jwt = require('jsonwebtoken');
const { removeListener } = require("../models/User");

exports.isLoggedIn = bigPromise(async (req,res,next) => {
    const token= req.cookies.token ||req.header("Authorization").replace("Bearer ","")  || req.body

    if(!token)
    {
        return next(new CustomError('Login first to access this page'))
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();

})

exports.customRole = (...role) => {
    return (req,res,next) => {
        if(!(role.includes(req.user.role)))
        {
            return next(new CustomError('You are not allowed for this resource',403))
        }
        next();
    }

}