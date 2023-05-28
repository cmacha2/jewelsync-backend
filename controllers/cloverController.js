const { default: axios } = require("axios");
const shopifyRequest = require("../utils/shopifyRequest");
const { decrypt } = require("../utils/utils");
const crypto = require('crypto');
const qs = require('qs');

exports.create = async (req, res) => {

}

exports.webhooks = async (req, res) => {
    console.log(req.body);
}





exports.callback = async (req, res) => {
  const code = req.query.code;

  if (code) {
    const clientId = 'WRF9X2RT9JV2Y';
    const clientSecret = 'e895ca95-84a9-1685-2649-e45fd4def031';
    const tokenUrl = 'https://sandbox.dev.clover.com/oauth/token';

    const data = qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code
    });

    const config = {
      method: 'post',
      url: tokenUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data : data
    };

    try {
      const response = await axios(config);
      const accessToken = response.data.access_token;

      // Aquí iría el código para guardar el token de acceso
        

      res.json({ accessToken });
    } catch (error) {
      console.error('Error obteniendo el token de acceso:', error);
      res.status(500).json({ error: 'Error obteniendo el token de acceso' });
    }
  } else {
    res.status(400).json({ error: 'No se proporcionó el código de autorización' });
  }
}
