const cookieToken = (user,res) => {
    const token = user.getJwtToken();
    const options = {
        expiresin:new Date(Date.now +process.env.COOKIE_TIME *24 *60*60*1000),
        httpOnly:true,
    }
    user.password = undefined;
    res.status(200).cookie('token',token,options).json({
        scuccess:true,
        token,
        user
    })
}

module.exports = cookieToken;