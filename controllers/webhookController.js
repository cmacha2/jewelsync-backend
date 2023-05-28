const shopifyRequest = require("../utils/shopifyRequest");
const { decrypt, findShopSecretKey, verifyAndParseWebhook, sendNotification } = require("../utils/utils");
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_ID , process.env.TWILIO_AUTH_TOKEN);


exports.createWebhook = async (req, res) => {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;

    const webhookData = {
        webhook: {
            topic: 'orders/create',
            address: `https://cf79-2600-1700-1176-a000-3140-516b-ecbf-e714.ngrok-free.app/api/webhooks`,
            format: 'json'
        }
    };


    try {
        const response = await shopifyRequest(shop, accessToken, "POST", "webhooks.json", {}, webhookData);
        const createdWebhook = response.data
        console.log(createdWebhook);
        res.json(createdWebhook);
    }
    catch (error) {
        console.error("Error al crear el webhook:", error);
        res.status(500).json({ error: "Error al crear el webhook" });
    }
    
}

exports.receiveOrder = async (req, res) => {
    const io = req.app.get('io');


    try {
        const webhookPayload = await verifyAndParseWebhook(req);
        console.log('Webhook received:', webhookPayload);

        if (webhookPayload.topic === 'orders/create') {
            console.log('Order creation webhook:', webhookPayload);
            io.emit('newOrder', webhookPayload);
            client.messages.create({
                body: `New order ${webhookPayload.data.name}`,
                to: '+1 786 681 9847',  // Reemplaza con el número de teléfono al que quieres enviar el SMS
                from: '+13156678446' // Reemplaza con tu número de teléfono de Twilio
            })
            .then((message) => console.log(message.sid));
            // await sendNotification(webhookPayload.domain, webhookPayload.data);
        }

        res.status(200).end();
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
};





exports.receiveProductUpdate = async (req, res) => {
    const io = req.app.get('io');
    try {
        const webhookPayload = await verifyAndParseWebhook(req);
        console.log('Webhook received:', webhookPayload);

        if (webhookPayload.topic === 'products/update') {
            console.log('Order creation webhook:', webhookPayload);
            // io.emit('newOrder', webhookPayload); poner product update
        }

        res.status(200).end();
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
}



// exports.recieveNotification = async (req, res) => {
//   const event = req.headers
//   const data = req.body.data;

//   // Do something with the event and data
//   console.log(event, data);


//   res.sendStatus(200);
// }