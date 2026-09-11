import { useContext } from "react";
import { CartContext } from "../cardcontext/cartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useContext(CartContext);

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // Empty Cart
  if (cartItems.length === 0) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-5">
          Your Cart is Empty
        </h2>

        <Link
          to="/allproducts"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg"
        >
          Continue Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 py-8 sm:px-5 sm:py-10">

      <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cart Products */}
        <div className="lg:col-span-2 space-y-5">

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-stretch sm:flex-row sm:flex-wrap md:flex-nowrap sm:items-center justify-between bg-zinc-100 p-4 sm:p-5 rounded-xl gap-4 sm:gap-5"
            >

              {/* Image */}
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain self-center sm:self-auto"
              />

              {/* Product Name */}
              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  {item.name}
                </h2>

                <p className="text-gray-600">
                  ${Number(item.price).toFixed(2)}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3">

                <button
                  onClick={() => decreaseQuantity(item.id)}
                  className="w-9 h-9 bg-white rounded-lg font-bold"
                >
                  -
                </button>

                <span className="font-bold">
                  {item.quantity}
                </span>

                <button
                  onClick={() => increaseQuantity(item.id)}
                  className="w-9 h-9 bg-white rounded-lg font-bold"
                >
                  +
                </button>

              </div>

              {/* Subtotal */}
              <p className="font-bold">
                $
                {(
                  Number(item.price) * item.quantity
                ).toFixed(2)}
              </p>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 font-semibold"
              >
                Remove
              </button>

            </div>
          ))}

        </div>

        {/* Summary */}
        <div className="bg-zinc-100 p-4 sm:p-6 rounded-xl h-fit">

          <h2 className="text-2xl font-bold mb-6">
            Order Summary
          </h2>

          <div className="flex justify-between mb-4">
            <span>Items</span>
            <span>{cartItems.length}</span>
          </div>

          <div className="flex justify-between border-t pt-4">
            <span className="text-xl font-bold">
              Total
            </span>

            <span className="text-xl font-bold">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <Link
            to="/payment"
            className="block text-center bg-orange-500 text-white py-3 rounded-lg mt-6 hover:bg-orange-600"
          >
            Proceed to Payment
          </Link>

        </div>

      </div>

    </section>
  );
};

export default Cart;

