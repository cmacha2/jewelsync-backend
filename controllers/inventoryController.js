const axios = require("axios");
const { decrypt } = require("../utils/utils");
const shopifyRequest = require("../utils/shopifyRequest");

exports.adjustInventory = async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const accessToken = decrypt(authorizationHeader.split(" ")[1]);
  const shop = req.headers.shop;
  const { available, inventory_item_id } = req.body;

  try {

    const responseLocation = await shopifyRequest(shop,accessToken, 'GET', `/inventory_levels.json?inventory_item_ids=${inventory_item_id}`);
    console.log(responseLocation.data);
    const {location_id} = responseLocation.data.inventory_levels.find((location) => location.location_id)

    if(location_id.length > 1){
      res.status(500).json({ error: 'Error getting location id' });
    }else{
      const data = {
        inventory_item_id,
        location_id: `${location_id}`,
        available
      };

    const response = await shopifyRequest(shop,accessToken, 'POST', "inventory_levels/set.json",{}, data);
    console.log(response.data);
    res.json(response.data);
    }
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    res.status(500).json({ error: 'Error adjusting inventory' });
  }
};

// exports.getLocationId = async (req, res) => {
//   const authorizationHeader = req.headers.authorization;
//   const accessToken = decrypt(authorizationHeader.split(" ")[1]);
//   const shop = req.headers.shop;

//   try {
//     const url = `https://${shop}.myshopify.com/admin/api/2023-04/locations.json`;
//     const query = {
//       query: location
//     };

//     const response = await updateInventory(accessToken, 'GET', url, query);
//     console.log(response.data);
//     res.json(response.data);
//   } catch (error) {
//     console.error('Error getting location id:', error);
//     res.status(500).json({ error: 'Error getting location id' });
//   }
// }

// const updateInventory = async (accessToken, method, url, data) => {
//   const config = {
//     method: method,
//     url: url,
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Shopify-Access-Token': accessToken
//     },
//     data: data
//   };

//   try {
//     const response = await axios(config);
//     return response;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };
