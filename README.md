## Technical Assesment

## Requirements

* Node v18
* postgresql

## postgresql configuration

username: postgres
password: password
database: bank
hostname: localhost
port:5432

## create command

CREATE TABLE CreditCardDetails(
   ID SERIAL PRIMARY KEY,
   CARDNUMBER CHAR(100)  NOT NULL,
   CVV CHAR(100) NOT NULL,
   NAME CHAR(500) NOT NULL,
   EXPIRYDATE CHAR(5)
);

## steps to install node modules
npm install


## steps to run app
npm run start
App will run in localhost:3000

## usage of Luhn Algorithm

Used to check if the card number is valid or invalid

