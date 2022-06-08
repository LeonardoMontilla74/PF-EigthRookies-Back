
const { Router } = require('express');
const createOrder = require('../controladores/orders/createOrder.js');
const getProductsOrder = require('../controladores/orders/getProductsOrder.js')

const route = Router()

route.post("", async(req, res) => {
    const {status, amount , user, productId} = req.body;
    try {
        const created = await createOrder(status, amount, user, productId)
    if (typeof created !== 'boolean') {
      return res.send(created);
        } else if (created) {
        return res.send({ msg: 'order created' });
        }
     res.send({ error: "couldn't create order" });
    } catch (error) {
        console.log(error)
    }
})

route.get('', async (req, res) =>{
    try {
    const { status } = req.query;
    console.log("hola soy status por query",status)
      const cart = await getProductsOrder(status);
      if (cart) {
        return res.send(cart);
      }
    res.send({ error: "couldn't find orders" });
    } catch (err) {
      console.log(err);
    }
  });

  module.exports = route;

module.exports = createOrder;
