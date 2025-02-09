import React from "react";
import { useSelector } from "react-redux";
import NoData from "../components/NoData";

const MyOrders = () => {
  const orders = useSelector((state) => state.orders.order);

  console.log("orders ", orders);

  return (
    <div>
      <div className="bg-white shadow-md p-3 font-semibold">
        <h1>Order</h1>
      </div>
      {!orders.length && <NoData />}
      {orders.map((order, index) => (
        <div
          key={order.order_id + index + "order"}
          className="order rounded p-4 text-sm border mb-4"
        >
          <p className="font-semibold">Order No: {order?.order_id}</p>
          <p className="text-gray-600 text-xs">
            Total Amount: ₹{order?.total_amount}
          </p>
          <div className="mt-2">
            {order?.product_details?.products?.map((product, idx) => (
              <div
                key={product.product_id + idx}
                className="flex gap-3 items-center border-b py-2"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    ₹{product.price} x {product.quantity}
                  </p>
                  <p className="text-sm font-semibold">
                    Subtotal: ₹{product.subtotal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
