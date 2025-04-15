const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/submit-form', async (req, res) => {
  const { name, email, message } = req.body;

  const html = `
    <html>
    <head><title>Submission</title></head>
    <body>
      <h1>Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    </body>
    </html>
  `;

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: false });
    await browser.close();

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: '"PDF Bot" <' + process.env.EMAIL_USER + '>',
      to: 'info@erietechnicalsystems.com',
      subject: 'Form Submitted (PDF)',
      text: 'See attached PDF of form submission.',
      attachments: [{
        filename: 'form-submission.pdf',
        content: pdfBuffer
      }]
    });

    res.send("Thanks! Your form has been submitted.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
