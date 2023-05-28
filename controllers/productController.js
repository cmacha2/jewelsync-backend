// controllers/productController.js
const shopifyRequest = require("../utils/shopifyRequest");
const { extractQueryParams, decrypt } = require("../utils/utils");

exports.getAllProducts = async (req, res) => {
  // let pageInfo = {
  //   previous: null,
  //   next: null,
  // };
  // try {
  //   const authorizationHeader = req.headers.authorization;
  //   const accessToken = decrypt(authorizationHeader.split(" ")[1]);
  //   const shop = req.headers.shop;

  //   const pageDirection = req.query.direction;

  //   let url = "";
  //   const baseURL = `https://${shop}.myshopify.com/admin/api/2021-04/`;

  //   if (pageDirection === "next" && pageInfo.next) {
  //     url = `products.json?${pageInfo.next}`;
  //   } else if (pageDirection === "prev" && pageInfo.previous) {
  //     url = `products.json?${pageInfo.previous}`;
  //   } else {
  //     url = `products.json?limit=50`;
  //   }

  //   const response = await shopifyRequest(shop, accessToken, "GET", url);
  //   const products = response.data.products;

  //   pageInfo.previous = extractQueryParams(
  //     response.headers.link,
  //     "previous",
  //     baseURL
  //   );
  //   pageInfo.next = extractQueryParams(response.headers.link, "next", baseURL);

  //   res.json({ products, pageInfo });
  // } catch (error) {
  //   res.status(500).send({ error: error.message });
  // }

    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;
    const query = { limit: 250 };
  
  const products = [];
  let hasNextPage = true;
  let pageInfo = null;

  try {
    while (hasNextPage) {
      const response = await shopifyRequest(shop, accessToken, "GET", `products.json${pageInfo ? `?page_info=${pageInfo}` : ''}`, query);
      products.push(...response.data.products);

      const linkHeader = response.headers.link;
      const match = linkHeader ? linkHeader.match(/page_info=([^>]+)>;\s*rel="next"/) : null;
      
      if (match) {
        pageInfo = match[1];
      } else {
        hasNextPage = false;
      }
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching products',
      error
    });
  }
};





exports.getProduct = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;
    const productId = req.params.productId; // Obtén el ID del producto desde los parámetros de la solicitud
    const url = `products/${productId}.json`; // Construye la URL para obtener el producto con el ID especificado

    const response = await shopifyRequest(shop, accessToken, "GET", url);
    const product = response.data.product;

    res.json(product); // Devuelve el producto como respuesta en formato JSON
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;

    // Obtén los datos del producto desde el cuerpo de la solicitud
    const {
      title,
      variants,
      options,
      images,
      published,
      metafields,
      seoTitle,
      seoDescription,
    } = req.body;

    // Crea el objeto de datos para el nuevo producto
    const productData = {
      product: {
        title,
        variants,
        options,
        images,
        published,
        metafields,
        seo: {
          title: seoTitle,
          description: seoDescription,
        },
      },
    };

    // Realiza una solicitud POST a la API de Shopify para crear el producto
    const response = await shopifyRequest(
      shop,
      accessToken,
      "POST",
      "products.json",
      productData
    );
    const createdProduct = response.data.product;

    res.json(createdProduct); // Devuelve el producto creado como respuesta en formato JSON
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;
    const productId = req.params.productId; // Obtén el ID del producto desde los parámetros de la solicitud

    // Obtén los datos actualizados del producto desde el cuerpo de la solicitud
    const {
      metafield,
      published,
      images,
      variants,
      seoTitle,
      seoDescription,
      status,
      tags,
      title,
    } = req.body;

    // Crea el objeto de datos para la actualización del producto
    const productData = {
      product: {
        id: productId,
        metafield,
        published,
        images,
        variants,
        seo: {
          title: seoTitle,
          description: seoDescription,
        },
        status,
        tags,
        title,
      },
    };

    // Realiza una solicitud PUT a la API de Shopify para actualizar el producto
    const response = await shopifyRequest(
      shop,
      accessToken,
      "PUT",
      `products/${productId}.json`,
      {},
      productData
    );
    res.json(response.data.product); // Devuelve el producto actualizado como respuesta en formato JSON
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(" ")[1]);
    const shop = req.headers.shop;
    const productId = req.params.productId; // Obtén el ID del producto desde los parámetros de la solicitud

    // Realiza una solicitud DELETE a la API de Shopify para eliminar el producto
    await shopifyRequest(
      shop,
      accessToken,
      "DELETE",
      `products/${productId}.json`
    );

    res.sendStatus(204); // Devuelve un código de estado 204 (Sin contenido) para indicar que la eliminación fue exitosa
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};

