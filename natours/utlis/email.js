const nodemailer = require('nodemailer');
const sendEmail = async options => {
  //STEP 1:Create transporter
  //we will define the service that will send emial like gmail
  /*
DA LAW GMAIL
	const transporter=nodemailer.createTransport({
	service:'Gmail',
	//gmail us not a good idea as 500 is max
	auth:{
		user:process.env.EMAIL_USERNAME,
		password:process.env.EMAIL_PASSWORD
	}
})
	*/

  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Replace with your Simple Mail Transfer Protocol host
    port: process.env.EMAIL_PORT, // Replace with your SMTP port (usually 587 or 465)
    auth: {
      //   user: "47bcfc54735b3e",
      //   password: "8c6b3b87e6da46"
      user: process.env.EMAIL_USERNAME,
      //khly balk de pass mesh password
      pass: process.env.EMAIL_PASSWORD
    }
  });
  //define email options
  const mailOptions = {
    from: 'Sender Name" <sender@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.msg
  };
  await transporter.sendMail(mailOptions);
};
//ana 3ayz a3ml keda new Email(user,url)
class advancedEmail {
  constructor(user, url) {
    this.from = 'Sender Name" <sender@example.com>';
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }
  createTransport() {
    if (process.env.NODE_ENV === 'production') return 1;
    else
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // Replace with your Simple Mail Transfer Protocol host
        port: process.env.EMAIL_PORT, // Replace with your SMTP port (usually 587 or 465)
        auth: {
          //   user: "47bcfc54735b3e",
          //   password: "8c6b3b87e6da46"
          user: process.env.EMAIL_USERNAME,
          //khly balk de pass mesh password
          pass: process.env.EMAIL_PASSWORD
        }
      });
  }
  send(template,subject)
  {
//send The actual email
//Steps
// 1)Renfer the pugTemplate
// 2)define emmail options
  const mailOptions = {
    from: this.from,
    to: this.to,
    subject,
    text
  };
  //step 3:Create transport and send Email
  }
  sendWelcome()
  {
    // this.send('template num from pug','welcome to the natours family');
    // this.send('');

  }
}

module.exports = sendEmail;
