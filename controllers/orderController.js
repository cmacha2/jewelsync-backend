// controllers/orderController.js
const shopifyRequest = require("../utils/shopifyRequest");
const { decrypt } = require("../utils/utils");
const CryptoJS = require("crypto-js");

exports.getAllOrders = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;

    // Realiza una solicitud GET a la API de Shopify para obtener todas las órdenes
    const response = await shopifyRequest(shop, accessToken, "GET", "orders.json?status=any");
    const orders = response.data.orders;

    res.json(orders); // Devuelve las órdenes como respuesta en formato JSON
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
    res.status(500).json({ error: "Error al obtener las órdenes" });
  }
};

exports.getMonthlyOrders = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if(!authorizationHeader) {
      return res.status(401).json({ error: "No se proporcionó un token de acceso" });
    }
    else if(!authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "El token de acceso debe comenzar con 'Bearer '" });
    }
    else if(!req.headers.shop) {
      return res.status(401).json({ error: "No se proporcionó el nombre de la tienda" });
    }
    
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    console.log(authorizationHeader.split(" ")[1])
    const shop = req.headers.shop;

    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const currentMonthOrders = await getOrdersForPeriod(shop, accessToken, currentMonthStart, today);
    console.log(`Se encontraron ${currentMonthOrders.length} órdenes en el mes actual`);
    const lastMonthOrders = await getOrdersForPeriod(shop, accessToken, lastMonthStart, lastMonthEnd);
    console.log(`Se encontraron ${lastMonthOrders.length} órdenes en el último mes`);

    let percentage = 0;

    if (lastMonthOrders.length > 0 && currentMonthOrders.length > 0) {
      percentage = ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100;
    } else if (lastMonthOrders.length === 0 && currentMonthOrders.length > 0) {
      percentage = 100;
    } else if (lastMonthOrders.length > 0 && currentMonthOrders.length === 0) {
      percentage = -100;
    }

    console.log(`El porcentaje de cambio de las órdenes de ventas es: ${percentage}%`);
    res.json({ currentMonthOrders, percentage });

  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
    res.status(500).json({ error: "Error al obtener las órdenes" });
  }
};

exports.getSixMonthsOrders =  async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if(!authorizationHeader) {
      return res.status(401).json({ error: "No se proporcionó un token de acceso" });
    }
    else if(!authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "El token de acceso debe comenzar con 'Bearer '" });
    }
    else if(!req.headers.shop) {
      return res.status(401).json({ error: "No se proporcionó el nombre de la tienda" });
    }
    
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1); // Calculate the date six months ago  

    const orders = await getOrdersForPeriod(shop, accessToken, sixMonthsAgo, currentDate);
    res.json({ orders });
  } catch (error) {
    console.error("Error retrieving orders for the last six months:", error);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
}


async function getOrdersForPeriod(shop, accessToken, start, end) {
  let since_id = '';
  let allOrders = [];
  let shouldContinue = true;

  // Asegurarse de que las fechas de inicio y final son instancias de Date
  if (!(start instanceof Date)) {
    start = new Date(start);
  }
  if (!(end instanceof Date)) {
    end = new Date(end);
  }

  while (shouldContinue) {
    try {
      const response = await shopifyRequest(shop, accessToken, "GET", `orders.json?status=any&since_id=${since_id}`);

      if (response.data.orders.length > 0) {
        allOrders = [...allOrders, ...response.data.orders.filter(order => {
          const createdAt = new Date(order.created_at);
          return createdAt >= start && createdAt <= end;
        })];

        // Siempre actualizamos el since_id para evitar un bucle infinito
        since_id = response.data.orders[response.data.orders.length - 1].id;

        // Comprobamos si la última orden de la respuesta está fuera del rango de tiempo requerido
        const lastOrderDate = new Date(response.data.orders[response.data.orders.length - 1].created_at);
        if (lastOrderDate && lastOrderDate < start) {
          shouldContinue = false;
        }
      } else {
        shouldContinue = false;
      }
    } catch (error) {
      console.error("Error al obtener órdenes: ", error);
      shouldContinue = false;
    }
  }

  return allOrders;
}


exports.getOrder = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;
    const orderId = req.params.orderId; // Obtén el ID de la orden desde los parámetros de la solicitud

    // Realiza una solicitud GET a la API de Shopify para obtener la orden con el ID especificado
    const response = await shopifyRequest(shop, accessToken, "GET", `orders/${orderId}.json`);
    const order = response.data.order;

    res.json(order); // Devuelve la orden como respuesta en formato JSON
  } catch (error) {
    console.error("Error al obtener la orden:", error);
    res.status(500).json({ error: "Error al obtener la orden" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;

    // Obtén los datos de la orden desde el cuerpo de la solicitud
    const orderData = req.body;

    // Realiza una solicitud POST a la API de Shopify para crear la orden
    const response = await shopifyRequest(shop, accessToken, "POST", "orders.json", orderData);
    const createdOrder = response.data.order;

    res.json(createdOrder); // Devuelve la orden creada como respuesta en formato JSON
  } catch (error) {
    console.error("Error al crear la orden:", error);
    res.status(500).json({ error: "Error al crear la orden" });
  }
};


exports.updateOrder = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;
    const orderId = req.params.orderId; // Obtén el ID de la orden desde los parámetros de la solicitud

    // Obtén los datos actualizados de la orden desde el cuerpo de la solicitud
    const { note, shippingAddress, billingAddress, financialStatus } = req.body;

    // Crea el objeto de datos para la actualización de la orden
    const orderData = {
      order: {
        id: orderId,
        note,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        financial_status: financialStatus,
      },
    };

    // Realiza una solicitud PUT a la API de Shopify para actualizar la orden
    const response = await shopifyRequest(
      shop,
      accessToken,
      "PUT",
      `orders/${orderId}.json`,
      orderData
    );
    const updatedOrder = response.data.order;

    res.json(updatedOrder); // Devuelve la orden actualizada como respuesta en formato JSON
  } catch (error) {
    console.error("Error al actualizar la orden:", error);
    res.status(500).json({ error: "Error al actualizar la orden" });
  }
};


exports.getCustomerOrders = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;
    const customerId = req.params.customerId; // Obtén el ID del cliente desde los parámetros de la solicitud

    // Realiza una solicitud GET a la API de Shopify para obtener las órdenes del cliente con el ID especificado
    const response = await shopifyRequest(shop, accessToken, "GET", `customers/${customerId}/orders.json`);
    const orders = response.data.orders;

    res.json(orders); // Devuelve las órdenes como respuesta en formato JSON
  } catch (error) {
    console.error("Error al obtener las órdenes del cliente:", error);
    res.status(500).json({ error: "Error al obtener las órdenes del cliente" });
  }
}


exports.fulfillOrder = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;
    const fulfillmentData = req.body;

    console.log(fulfillmentData)

    // Realiza una solicitud POST a la API de Shopify para crear el fulfillment
    const response = await shopifyRequest(
      shop,
      accessToken,
      "POST",
      `fulfillments.json`,
      {},
      fulfillmentData
    );
    
console.log(response.data.fulfillment)
    const fulfillment = response.data.fulfillment;

    // const orderDetails = await shopifyRequest(shop, accessToken, "GET", `orders/${fulfillment.order_id}.json`);

    res.status(201).json(fulfillment); // Devuelve el fulfillment creado como respuesta en formato JSON
  } catch (error) {
    console.error("Error al hacer fulfillment de la orden:", error);
    res.status(500).json({ error: "Error al hacer fulfillment de la orden" });
  }
};


exports.getOrderFulfillment = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;
    const orderId = req.params.orderId; // Obtén el ID de la orden desde los parámetros de la solicitud

    // Realiza una solicitud GET a la API de Shopify para obtener el fulfillment de la orden con el ID especificado
    const response = await shopifyRequest(shop, accessToken, "GET", `orders/${orderId}/fulfillment_orders.json`);
    const fulfillment = response.data
    res.json(fulfillment); // Devuelve el fulfillment como respuesta en formato JSON
  } catch (error) {
    console.error("Error al obtener el fulfillment de la orden:", error);
    res.status(500).json({ error: "Error al obtener el fulfillment de la orden" });
  }
}