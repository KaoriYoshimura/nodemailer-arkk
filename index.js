const express = require('express')
var bodyParser = require('body-parser')
var nodemailer = require("nodemailer")
const app = express()
const dotenv = require("dotenv")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}));

dotenv.config();

// Accept CORS requests
app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

const PORT = process.env.NODEMAIL_PORT || 3001

app.listen(PORT, () => {
    console.log('Server listening on port ${PORT}')
})

app.get('/test', (req, res) => {
    res.json('test');
})

// Configure SMTP transport
let transporter = nodemailer.createTransport({
    host: process.env.NODEMAIL_TRANSPORTER_HOST,
    port: process.env.NODEMAIL_TRANSPORTER_PORT,
    auth: {
        user: process.env.NODEMAIL_TRANSPORTER_USER,
        pass: process.env.NODEMAIL_TRANSPORTER_PASS
    },
})

app.post('/send', (req, res) => {
    nodemailer.createTestAccount((err, account) => {
        const htmlEmail = `
        <p>Hej ${req.body.name}!</p>
        <p>${req.body.openingMessage}<br>
        Boknings detaljer:
        </p>
        <ul>
            <li>Namn: ${req.body.name}</li>
            <li>Datum: ${req.body.date}</li>
            <li>Tid: ${req.body.time}</li>
            <li>Bokningsnummer: ${req.body.bookingId}</li>
        </ul>
        <p>${req.body.closingMessage}</p>
        <p>Restaurang ARKK</p>
        `

        let mailOptions = {
            from: 'test@testaccount.com',
            to: req.body.email,
            // to: "marlen.tremblay43@ethereal.email",
            subject: req.body.subject,
            html: htmlEmail
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return console.log(err)
            }

            console.log('Message sent: %s', info.messageId);
            console.log('Message sent: %s', nodemailer.getTestMessageUrl(info));
        })
    })

});