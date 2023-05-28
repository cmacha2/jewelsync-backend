const shopifyRequest = require("../utils/shopifyRequest");
const { decrypt, extractQueryParams } = require("../utils/utils");

exports.getCustomers = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;

    let since_id = 0;
    let allCustomers = [];
    let keepFetching = true;

    while (keepFetching) {
      const response = await shopifyRequest(
        shop,
        accessToken,
        "GET",
        "customers.json",
        { since_id }
      );

      const customers = response.data.customers;
      if (customers.length > 0) {
        allCustomers = [...allCustomers, ...customers];
        since_id = customers[customers.length - 1].id;
      } else {
        keepFetching = false;
      }
    }

    res.json(allCustomers);
  } catch (error) {
    console.error("Error getting the customer list:", error);
    res.status(500).json({ error: "Error getting the customer list" });
  }
};


exports.getCustomer = async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const accessToken = decrypt(authorizationHeader.split(" ")[1]);
  const shop = req.headers.shop;

  try {
    const customerId = req.params.customerId; // Obtén el ID del cliente desde los parámetros de la solicitud

    // Realiza la solicitud para obtener el cliente individual
    const response = await shopifyRequest(
      shop,
      accessToken,
      "GET",
      `customers/${customerId}.json`,
    );

    const customer = response.data.customer
    res.json(customer); // Devuelve el cliente como respuesta en formato JSON
  } catch (error) {
    console.error("Error al obtener el cliente:", error);
    res.status(500).json({ error: "Error al obtener el cliente" });
  }
};

exports.getMonthlyCustomers = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);

    const shop = req.headers.shop;

    const today = new Date();
    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    let since_id = null;
    let currentMonthCustomers = [];
    let lastMonthCustomers = [];

    while (true) {
      const response = await shopifyRequest(
        shop,
        accessToken,
        "GET",
        "customers.json",
        { since_id, created_at_min: currentMonthStart.toISOString() }
      );

      if (response.data.customers.length > 0) {
        currentMonthCustomers = [
          ...currentMonthCustomers,
          ...response.data.customers,
        ];
        since_id = currentMonthCustomers[currentMonthCustomers.length - 1].id;
      } else {
        break;
      }
    }

    since_id = null;

    while (true) {
      const response = await shopifyRequest(
        shop,
        accessToken,
        "GET",
        "customers.json",
        {
          since_id,
          created_at_min: lastMonthStart.toISOString(),
          created_at_max: lastMonthEnd.toISOString(),
        }
      );

      if (response.data.customers.length > 0) {
        lastMonthCustomers = [
          ...lastMonthCustomers,
          ...response.data.customers,
        ];
        since_id = lastMonthCustomers[lastMonthCustomers.length - 1].id;
      } else {
        break;
      }
    }

    let percentage = 0;

    if (lastMonthCustomers.length > 0 && currentMonthCustomers.length > 0) {
      percentage =
        ((currentMonthCustomers.length - lastMonthCustomers.length) /
          lastMonthCustomers.length) *
        100;
    } else if (
      lastMonthCustomers.length === 0 &&
      currentMonthCustomers.length > 0
    ) {
      percentage = 100;
    } else if (
      lastMonthCustomers.length > 0 &&
      currentMonthCustomers.length === 0
    ) {
      percentage = -100;
    }

    res.json({ currentMonthCustomers, percentage });
  } catch (error) {
    console.error("Error al obtener la lista de clientes:", error);
    res.status(500).json({ error: "Error al obtener la lista de clientes" });
  }
};
