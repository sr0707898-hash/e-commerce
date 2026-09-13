import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../cardcontext/cartContext";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
const USD_TO_INR = 83;

const Payment = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const [paymentType, setPaymentType] = useState("");

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    houseNo: "",
    sectorColony: "",
    district: "",
    state: "",
  });

  // Total Price
  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );
  const totalPriceInr = totalPrice * USD_TO_INR;
  const totalPriceInrLabel = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(totalPriceInr);
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `upi://pay?pa=owner@grocify&pn=Grocify&am=${totalPriceInr.toFixed(2)}&cu=INR&tn=Grocify%20Order%20Payment`
  )}`;

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

    const user = localStorage.getItem("user");

    if (!user) {
      alert("Please Login First!");
      navigate("/login", {
        state: { from: "/payment" },
      });
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!paymentType) {
      alert("Please select payment method!");
      return;
    }

    if (!userDetails.name || !userDetails.email || !userDetails.houseNo || !userDetails.sectorColony || !userDetails.district || !userDetails.state) {
      alert("Please fill all details!");
      return;
    }

    const savedUser = JSON.parse(user);
    const address = `${userDetails.houseNo}, ${userDetails.sectorColony}, ${userDetails.district}, ${userDetails.state}`;
    const orderRecord = {
      id: `GC-${crypto.randomUUID()}`,
      customer: userDetails.name || savedUser.name || "Customer",
      email: String(savedUser.email || userDetails.email || "").trim().toLowerCase(),
      address,
      houseNo: userDetails.houseNo,
      sectorColony: userDetails.sectorColony,
      district: userDetails.district,
      state: userDetails.state,
      phone: savedUser.phone || "",
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      totalUSD: Number(totalPrice.toFixed(2)),
      totalINR: Number(totalPriceInr.toFixed(2)),
      paymentMethod: paymentType,
      status: "Processing",
      createdAt: new Date().toISOString(),
      qrCode: paymentType === "UPI" ? upiQrUrl : "",
    };

    const existingOrders = JSON.parse(localStorage.getItem("grocify_orders") || "[]");
    localStorage.setItem("grocify_orders", JSON.stringify([orderRecord, ...existingOrders]));
    window.dispatchEvent(new Event("ordersUpdated"));

    fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderRecord),
    }).catch((error) => console.error("Order could not be saved to dashboard:", error));

    clearCart();

    alert(
      `Payment Successful!\nPayment Method: ${paymentType}\nAmount: ${totalPriceInrLabel}`
    );

    console.log("Order Details:", {
      user: savedUser,
      items: cartItems,
      total: totalPrice,
      totalInr: totalPriceInr,
      paymentMethod: paymentType,
      customer: userDetails,
      order: orderRecord,
    });
  };

  return (
    <section className="min-h-screen w-full max-w-[1200px] mx-auto bg-white px-4 py-8 sm:px-5 sm:py-10">

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

          <div className="mt-5 rounded-2xl bg-orange-50 p-4">
            <p className="text-sm text-slate-600">Total in India (INR)</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">{totalPriceInrLabel}</p>
          </div>
        </div>

        {/* ================= PAYMENT FORM ================= */}
        <div className="bg-zinc-100 p-4 sm:p-6 rounded-xl text-zinc-900 [color-scheme:light]">

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
              className="w-full bg-white p-3 mb-4 rounded-lg outline-none text-zinc-900 placeholder:text-zinc-500"
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              value={userDetails.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full bg-white p-3 mb-4 rounded-lg outline-none text-zinc-900 placeholder:text-zinc-500"
            />

            {/* Delivery Address */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-zinc-900">
              <input required name="houseNo" value={userDetails.houseNo} onChange={handleChange} placeholder="House No." className="w-full bg-white p-3 rounded-lg outline-none text-zinc-900 placeholder:text-zinc-500" />
              <input required name="sectorColony" value={userDetails.sectorColony} onChange={handleChange} placeholder="Sector / Colony" className="w-full bg-white p-3 rounded-lg outline-none text-zinc-900 placeholder:text-zinc-500" />
              <input required name="district" value={userDetails.district} onChange={handleChange} placeholder="District" className="w-full bg-white p-3 rounded-lg outline-none text-zinc-900 placeholder:text-zinc-500" />
              <input required name="state" value={userDetails.state} onChange={handleChange} placeholder="State" className="w-full bg-white p-3 rounded-lg outline-none text-zinc-900 placeholder:text-zinc-500" />
            </div>

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

            {paymentType === "UPI" && (
              <div className="mt-5 rounded-2xl bg-white p-4 text-center">
                <p className="mb-3 text-sm font-semibold text-slate-700">Scan QR to pay {totalPriceInrLabel}</p>
                <img
                  src={upiQrUrl}
                  alt="UPI QR code"
                  className="mx-auto h-52 w-52 rounded-xl border border-slate-200 bg-white p-2"
                />
                <p className="mt-3 text-xs text-slate-500">UPI ID: owner@grocify</p>
              </div>
            )}

            <div className="mt-5 rounded-2xl bg-white p-3 text-sm text-slate-600">
              <p>Bill amount in INR: <span className="font-bold text-slate-900">{totalPriceInrLabel}</span></p>
            </div>

            <button
              type="submit"
              className="mt-5 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold"
            >
              Pay {totalPriceInrLabel}
            </button>

          </form>

        </div>

      </div>
    </section>
  );
};

export default Payment;
