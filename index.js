require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const CryptoJS = require("crypto-js");
const Luhn = require('luhn-js');
const Pool = require('pg').Pool;

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DB,
    password: process.env.PASSWORD,
    dialect: process.env.DIALECT,
    port: 5432
});


const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})
app.post('/submit-card-details', function (req, res) {

    try {
        const data = req.body;
        const cardNumber = data.cardNumber;
        const cvv = data.cvv;
        const name = data.name;
        const expiryDate = data.expiryDate;

        const errorString = [];

        //validation for card number
        if (cardNumber.length != 0) {
            if (!parseInt(cardNumber.slice(0)) || parseInt(cardNumber.slice(0)).toString().length !== 16) {
                errorString.push("Card Number wrong")
            } else if (!(Luhn.isValid(cardNumber))) {
                //luhn algorith validation check for valid credit card number
                errorString.push("Invalid Card Number wrong")
            }
        } else {
            errorString.push("Card Number empty")
        }

        //validation for cvv
        if (cvv.length != 0) {
            if (!parseInt(cvv.slice(0)) || parseInt(cvv.slice(0)).toString().length !== 3) {
                errorString.push("CVV wrong")
            }
        } else {
            errorString.push("CVV empty")
        }

        //validation for name
        if (name.length === 0) {
            errorString.push("Name is empty")
        }
        else if (!isNaN(name)) {
            errorString.push("Name should not be number")
        }

        //validation for expiry date
        if (expiryDate.length != 0) {
            if (expiryDate.length < 5 || !parseInt(expiryDate.slice(0, 2)) || parseInt(expiryDate.slice(0, 2)).toString().length != 2 || expiryDate[2] !== '/' || !parseInt(expiryDate.slice(3)) || parseInt(expiryDate.slice(3)).toString().length != 2) {
                errorString.push("Expiry Date format wrong")
            }
        }
        else {
            errorString.push('Expiry date empty');
        }

        if (errorString.length) {
            res.status(500).json({ error: errorString.join(',') })
        }
        else {

            const encryptedCardNumber = CryptoJS.AES.encrypt(cardNumber, process.env.CARDENCRYPTIONKEY).toString();
            const encryptedCVV = CryptoJS.AES.encrypt(cvv, process.env.CVVENCRYPTIONKEY).toString();

            // insert record into Database
            pool.query(`INSERT INTO CREDITCARDDETAILS (CARDNUMBER,CVV,NAME,EXPIRYDATE) VALUES ('${encryptedCardNumber}', '${encryptedCVV}', '${name}', '${expiryDate}')`)
                .then(CreditCardDetail => {
                    res.status(200).json({ msg: 'Successfully Added Card' })
                })
                .catch(e => {
                    res.status(500).send(JSON.stringify(e));
                })

        }

    }
    catch (e) {
        res.status(500).send(JSON.stringify(e));
    }
})


app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
})