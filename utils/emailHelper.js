const nodemailer = require("nodemailer");

const mailHelper = async(option) => {
 // create reusable transporter object using the default SMTP transport
 const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port:  process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass:  process.env.SMTP_PASSWORD, // generated ethereal password
    },
    
  });
  console.log(process.env.SMTP_HOST)
  let message = {
    from: 'hmmho300@gmail.com', // sender address
    to: option.email, // list of receivers
    subject: option.subject, // Subject line
    text: option.message, // plain text body
    
  }
  console.log(message)
  // send mail with defined transport object
    await transporter.sendMail(message);
}

module.exports = mailHelper;