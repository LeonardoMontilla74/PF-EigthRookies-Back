const mercadopago = require('mercadopago');
require('dotenv').config();
const { ACCESS_TOKEN, URL_DEPLOYD } = process.env;
const { redirect } = require('express/lib/response');
const { ShoppingCar } = require('../db');
const { sendEmailPurchase } = require('../controladores/util/sendEmail');
const purchaseHistory = require('./purchaseHistory')

let email = null;

const createOrder = async (req, res, next) => {

    const { carrito, userEmail } = req.body;
    email = userEmail;

    mercadopago.configure({
        access_token: ACCESS_TOKEN
    });

    const allProducts = carrito.map(item => ({
        title: item.title,
        unit_price: item.price,
        quantity: item.quantity,
    }));

    const preference = {
        items: allProducts,
        auto_return: 'approved',
        back_urls: {
            failure: `${URL_DEPLOYD}/products/carrito`,
            pending: `${URL_DEPLOYD}/mercadopay/status`,
            success: `${URL_DEPLOYD}/mercadopay/status`
        }
    };

    mercadopago.preferences.create(preference)
        .then((data) => {
            res.status(200).send({ url: data.response.init_point }); //url de mercado pago
        })
        .catch((e) => {
            res.status(400).json(e);
            next();
        });
};


const handleStatus = async (req, res, next) => {

    const status = req.query;

    try {

        const newShoppingCar = await ShoppingCar.create({
            status: status.status,
            payment_id: status.payment_id,
            payment_type: status.payment_type,
        });

        purchaseHistory(newShoppingCar, email)
        sendEmailPurchase(email, newShoppingCar.payment_id);

        res.redirect(`https://the-rookies.vercel.app/purchase/${newShoppingCar.payment_id}`);

    } catch (error) {
        console.error(error);
        next();
    }
};

module.exports = { createOrder, handleStatus };
