const CryptoJS = require("crypto-js");
const { db, admin } = require("../firebase/firebase");
const secretKey = 'StartTechSecretKey';
const crypto = require('crypto');


function extractQueryParams(linkHeader, rel, baseURL) {
    const link = linkHeader.split(", ").find((link) => link.includes(`rel="${rel}"`));
    if (!link) return null;
    const fullUrl = link.match(/<(.*?)>/)[1];
    const urlWithoutBase = fullUrl.replace(baseURL, "");
    const queryParams = urlWithoutBase.split("?")[1];
    return queryParams ? queryParams : null;
}


// Función para encriptar
function encrypt(text) {
  console.log(text);
  const ciphertext = CryptoJS.AES.encrypt(text, secretKey).toString();
  return ciphertext;
}

// Función para desencriptar
function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  console.log(originalText);
  return originalText;
}


async function verifyAndParseWebhook(req) {
  const body = req.rawBody;
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  const shopDomain = req.headers['x-shopify-shop-domain'].replace('.myshopify.com', '');

  // if(shopDomain==='milazzo-jewelry-store'||shopDomain==='milazzojewelry.com'){
  //   shopDomain = 'milazzo-jewelry-store';
  //   var webhook_secret = await findShopSecretKey(shopDomain);
  // }

  const webhook_secret = await findShopSecretKey(shopDomain);

  const calculatedHmac = crypto.createHmac('sha256', webhook_secret)
      .update(body, 'utf8')
      .digest('base64');

  if (calculatedHmac !== hmacHeader) {
      throw new Error('HMAC validation failed!');
  }

  return {
      topic: req.header('X-Shopify-Topic'),
      domain: shopDomain,
      data : JSON.parse(body)
  }
}


async function findShopSecretKey(shopDomain) {
  console.log('Buscando secreto del webhook para la tienda con el dominio:', shopDomain)
  const docRef = db.collection("shopifyWebhookSecrets").doc(shopDomain);
  const doc = await docRef.get();

  if (!doc.exists) {
    console.log('No se encontró el secreto del webhook para la tienda con el dominio:', shopDomain);
    return null;
  } else {
    console.log('Secreto del webhook:', doc.data());
    return doc.data().webhookSecret;
  }
}

async function sendNotification(shopDomain, order) {
  const docRef = db.collection("pushNotification").doc(shopDomain)
  const doc = await docRef.get();

  if (!doc.exists) {
    console.log('No se encontró el token de notificación para la tienda con el dominio:', shopDomain);
    return null;
  }
  else {
    console.log('Token de notificación:', doc.data());
    const message = {
      notification: {
        title: `New order ${order.name}`,
        body: `Total price: ${order.total_price}\n`
      },
      token: doc.data().currentToken
  }
  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    }
    )
    .catch((error) => {
      console.log('Error sending message:', error);
    }
    );
  }

}

module.exports = {
    extractQueryParams,
    encrypt,
    decrypt,
    findShopSecretKey,
    verifyAndParseWebhook,
    sendNotification
};
