const axios = require('axios');

const shopifyRequest = async (shop, accessToken, method, url, query = {},data) => {
    const config = {
        method: `${method}`,
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken
        },
        params: query,
        data: data
    };

    try {
        const response = await axios(`https://${shop}.myshopify.com/admin/api/2023-04/${url}`, config);

        return response;
    } catch (error) {
        console.error(error);
        throw error; // Asegúrate de manejar este error en la función que llama a shopifyRequest.
    }
};

module.exports = shopifyRequest;
