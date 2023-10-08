const mailConfig = {
	host: "smtp.localhost.com",
    port: 465,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'noreply@localhost.com',
      pass: 'secret_password',
    }
}

module.exports = mailConfig;
