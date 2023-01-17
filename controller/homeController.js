const bigPromise = require('../middleware/bigPromise.js')
console.log(bigPromise)
exports.home =bigPromise((req,res) => {
    res.status(200).json({
        success:true,
        greeting:"Hello from home api"
    })
});