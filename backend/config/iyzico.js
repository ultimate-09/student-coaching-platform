const Iyzipay = require('iyzipay');

const iyzico = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'
});

module.exports = iyzico;
