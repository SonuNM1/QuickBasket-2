import Stripe from "../config/stripe.js";

import { executeQuery } from "../utils/DBUtils.js";

export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId;
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    // // console.log("hello oders", request.body);

    const orderQueries = list_items.map((el) => {
      return executeQuery(
        `INSERT INTO orders (user_id, order_id, product_id, product_name, product_image, payment_id, payment_status, delivery_address_id, subtotal_amount, total_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          `ORD-${Date.now()}`,
          el.productId._id,
          el.productId.name,
          JSON.stringify(el.productId.image),
          "",
          "CASH ON DELIVERY",
          addressId,
          subTotalAmt,
          totalAmt,
        ]
      );
    });
    await Promise.all(orderQueries);

    // Remove items from cart
    await executeQuery("DELETE FROM cart_product WHERE user_id = ?", [userId]);

    return response.json({
      message: "Order confirmed! We’ll start processing it shortly.",
      error: false,
      success: true,
    });
  } catch (error) {
    return response
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
}
// Get Order Details Controller
export async function getOrderDetailsController(request, response) {
  try {
    // console.log("getting orders__");
    const userId = request.userId;

    const orderList = await executeQuery(
      `SELECT 
              o.*, 
              JSON_OBJECT(
                  'products', JSON_ARRAYAGG(
                      JSON_OBJECT(
                          'product_id', p.id,
                          'name', p.name,
                          'image',p.image,
                          'price', p.price
                      )
                  )
              ) AS product_details
        FROM orders o
        JOIN address a ON o.delivery_address_id = a.id
        JOIN orders oi ON o.id = oi.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ?
        GROUP BY o.id, a.id
        ORDER BY o.created_at DESC`,
      [userId]
    );

    // // console.log("orderList", orderList);

    return response.json({
      message: "Order list",
      data: orderList,
      error: false,
      success: true,
    });
  } catch (error) {
    // console.log(error);
    return response
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
}

export const pricewithDiscount = (price, dis = 1) => {
  const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100);
  const actualPrice = Number(price) - Number(discountAmout);
  return actualPrice;
};

export async function paymentController(request, response) {
  try {
    const userId = request.userId; // Auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const user = await executeQuery(`SELECT email FROM users WHERE id = ?`, [
      userId,
    ]);

    if (!user.length) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const line_items = list_items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.productId.name,
          images: item.productId.image,
          metadata: {
            productId: item.productId.id, // SQL doesn't use _id like MongoDB
          },
        },
        unit_amount:
          pricewithDiscount(item.productId.price, item.productId.discount) *
          100,
      },
      adjustable_quantity: {
        enabled: true,
        minimum: 1,
      },
      quantity: item.quantity,
    }));

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user[0].email,
      metadata: {
        userId: userId,
        addressId: addressId,
      },
      line_items: line_items,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    };

    const session = await Stripe.checkout.sessions.create(params);

    return response.status(200).json(session);
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

import { v4 as uuidv4 } from "uuid";

const getOrderProductItems = async ({
  lineItems,
  userId,
  addressId,
  paymentId,
  payment_status,
}) => {
  const productList = [];

  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const product = await Stripe.products.retrieve(item.price.product);

      const payload = {
        userId: userId,
        orderId: `ORD-${uuidv4()}`, // Generate a unique order ID
        productId: product.metadata.productId,
        product_details: JSON.stringify({
          name: product.name,
          image: product.images,
        }),
        paymentId: paymentId,
        payment_status: payment_status,
        delivery_address: addressId,
        subTotalAmt: Number(item.amount_total / 100),
        totalAmt: Number(item.amount_total / 100),
      };

      productList.push(payload);
    }
  }

  return productList;
};

//http://localhost:8080/api/order/webhook

export async function webhookStripe(request, response) {
  try {
    const event = request.body;
    // // console.log("event", event);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const lineItems = await Stripe.checkout.sessions.listLineItems(
          session.id
        );
        const userId = session.metadata.userId;

        const orderProduct = await getOrderProductItems({
          lineItems: lineItems,
          userId: userId,
          addressId: session.metadata.addressId,
          paymentId: session.payment_intent,
          payment_status: session.payment_status,
        });

        // Insert order details into the SQL database
        const insertQuery = `
            INSERT INTO orders 
            (userId, orderId, productId, product_details, paymentId, payment_status, delivery_address, subTotalAmt, totalAmt)
            VALUES ${orderProduct
              .map(
                (o) =>
                  `('${o.userId}', '${o.orderId}', '${
                    o.productId
                  }', '${JSON.stringify(o.product_details)}', '${
                    o.paymentId
                  }', '${o.payment_status}', '${o.delivery_address}', ${
                    o.subTotalAmt
                  }, ${o.totalAmt})`
              )
              .join(", ")}
          `;
        await executeQuery(insertQuery);

        // console.log("Order inserted successfully");

        // Remove items from the shopping cart
        await executeQuery(
          `UPDATE users SET shopping_cart = '[]' WHERE id = '${userId}'`
        );
        await executeQuery(
          `DELETE FROM cart_products WHERE userId = '${userId}'`
        );

        break;
      default:
      // console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    response.status(500).json({ error: error.message });
  }
}
