const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noreplayliferich@gmail.com",
    pass: "seqy mpaf dvbu kszq"
  }
});

module.exports = transporter;
