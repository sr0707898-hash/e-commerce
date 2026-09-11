import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../cardcontext/cartContext";

const Payment = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useContext(CartContext);

  

  const navigate = useNavigate();

  const [paymentType, setPaymentType] = useState("");

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    address: "",
  });

  // Total Price
  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // Input Change
  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  // Payment
  const handlePayment = (e) => {
    e.preventDefault();

    // Login check
    const user = localStorage.getItem("user");

    if (!user) {
      alert("Please Login First!");
      navigate("/login", {
        state: { from: "/payment" },
      });
      return;
    }

    // Cart empty check
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Payment method check
    if (!paymentType) {
      alert("Please select payment method!");
      return;
    }

    // User details check
    if (
      !userDetails.name ||
      !userDetails.email ||
      !userDetails.address
    ) {
      alert("Please fill all details!");
      return;
    }

    // Payment success
    alert(
      `Payment Successful!\nPayment Method: ${paymentType}\nAmount: $${totalPrice.toFixed(
        2
      )}`
    );

    console.log("Order Details:", {
      user: JSON.parse(user),
      items: cartItems,
      total: totalPrice,
      paymentMethod: paymentType,
      customer: userDetails,
    });
  };

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 py-8 sm:px-5 sm:py-10">

      <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10">
        Payment
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ================= ORDER ================= */}
        <div>
          <h2 className="text-2xl font-bold mb-5">
            Your Order
          </h2>

          {cartItems.length === 0 ? (
            <p className="text-red-500 font-bold">
              Your cart is empty
            </p>
          ) : (
            <div className="space-y-4">

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-100 p-5 rounded-xl"
                >

                  <div className="flex items-center justify-between">

                    {/* Product */}
                    <div className="flex items-center gap-4">

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-contain"
                      />

                      <div>
                        <h3 className="font-bold text-lg">
                          {item.name}
                        </h3>

                        <p>
                          ${Number(item.price).toFixed(2)}
                        </p>
                      </div>

                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-3">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        className="w-9 h-9 bg-white rounded-lg font-bold text-xl"
                      >
                        -
                      </button>

                      <span className="font-bold text-lg">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        className="w-9 h-9 bg-orange-500 text-white rounded-lg font-bold text-xl"
                      >
                        +
                      </button>

                    </div>

                  </div>

                  {/* Item Total */}
                  <div className="flex justify-between mt-4 border-t pt-3">

                    <span>
                      Item Total
                    </span>

                    <span className="font-bold">
                      $
                      {(
                        Number(item.price) *
                        item.quantity
                      ).toFixed(2)}
                    </span>

                  </div>

                  {/* Remove */}
                  <button
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                    className="text-red-500 mt-2"
                  >
                    Remove
                  </button>

                </div>
              ))}

            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between text-2xl font-bold border-t mt-6 pt-5">

            <span>
              Total
            </span>

            <span>
              ${totalPrice.toFixed(2)}
            </span>

          </div>
        </div>

        {/* ================= PAYMENT FORM ================= */}
        <div className="bg-zinc-100 p-4 sm:p-6 rounded-xl">

          <h2 className="text-2xl font-bold mb-6">
            Payment Details
          </h2>

          <form onSubmit={handlePayment}>

            {/* Name */}
            <input
              type="text"
              name="name"
              value={userDetails.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-3 mb-4 rounded-lg outline-none"
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              value={userDetails.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 mb-4 rounded-lg outline-none"
            />

            {/* Address */}
            <textarea
              name="address"
              value={userDetails.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full p-3 mb-4 rounded-lg outline-none"
              rows="4"
            />

            {/* Payment Method */}
            <h3 className="font-bold text-lg mb-3">
              Select Payment Method
            </h3>

            {/* UPI */}
            <label className="flex items-center gap-3 bg-white p-3 rounded-lg mb-3 cursor-pointer">

              <input
                type="radio"
                name="payment"
                value="UPI"
                checked={paymentType === "UPI"}
                onChange={(e) =>
                  setPaymentType(e.target.value)
                }
              />

              <span>
                UPI
              </span>

            </label>

            {/* Card */}
            <label className="flex items-center gap-3 bg-white p-3 rounded-lg mb-3 cursor-pointer">

              <input
                type="radio"
                name="payment"
                value="Credit/Debit Card"
                checked={
                  paymentType === "Credit/Debit Card"
                }
                onChange={(e) =>
                  setPaymentType(e.target.value)
                }
              />

              <span>
                Credit / Debit Card
              </span>

            </label>

            {/* COD */}
            <label className="flex items-center gap-3 bg-white p-3 rounded-lg mb-5 cursor-pointer">

              <input
                type="radio"
                name="payment"
                value="Cash on Delivery"
                checked={
                  paymentType === "Cash on Delivery"
                }
                onChange={(e) =>
                  setPaymentType(e.target.value)
                }
              />

              <span>
                Cash on Delivery
              </span>

            </label>

            {/* Pay Button */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold"
            >
              Pay ${totalPrice.toFixed(2)}
            </button>

          </form>

        </div>

      </div>
    </section>
  );
};

export default Payment;
