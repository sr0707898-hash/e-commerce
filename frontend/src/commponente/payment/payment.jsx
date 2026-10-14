import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../cardcontext/cartContext";

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? `http://${window.location.hostname}:5000` : "/api");
const USD_TO_INR = 83;

const loadRazorpayCheckout = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(false);

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    houseNo: "",
    sectorColony: "",
    district: "",
    state: "",
  });

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/payments/razorpay/config`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Could not load payment options"))))
      .then((config) => {
        if (active) setOnlinePaymentsEnabled(Boolean(config.onlinePaymentsEnabled));
      })
      .catch(() => {
        if (active) setOnlinePaymentsEnabled(false);
      });

    return () => {
      active = false;
    };
  }, []);

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
  // Input Change
  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  const saveOrderLocally = (order) => {
    const existingOrders = JSON.parse(localStorage.getItem("grocify_orders") || "[]");
    localStorage.setItem("grocify_orders", JSON.stringify([order, ...existingOrders]));
    window.dispatchEvent(new Event("ordersUpdated"));
  };

  const handlePayment = async (e) => {
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
      paymentStatus: "Pending",
      status: "Processing",
      createdAt: new Date().toISOString(),
    };

    setPaymentError("");
    setIsProcessing(true);

    try {
      if (paymentType === "Cash on Delivery") {
        const response = await fetch(`${API_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderRecord),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Could not place this order");

        const savedOrder = data.order || orderRecord;
        saveOrderLocally(savedOrder);
        clearCart();
        setIsProcessing(false);
        alert(`Order placed. Payment is due on delivery.\nAmount: ${totalPriceInrLabel}`);
        return;
      }

      const scriptLoaded = await loadRazorpayCheckout();
      if (!scriptLoaded) throw new Error("Secure payment checkout could not be loaded. Please try again.");

      const orderResponse = await fetch(`${API_URL}/payments/razorpay/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRecord }),
      });
      const razorpayOrder = await orderResponse.json().catch(() => ({}));
      if (!orderResponse.ok) throw new Error(razorpayOrder.message || "Could not start secure checkout");

      const checkout = new window.Razorpay({
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Grocify",
        description: "Grocery order payment",
        order_id: razorpayOrder.orderId,
        prefill: { name: userDetails.name, email: orderRecord.email, contact: orderRecord.phone },
        notes: { appOrderId: orderRecord.id },
        method: { upi: paymentType === "UPI", card: paymentType === "Credit/Debit Card" },
        theme: { color: "#c2410c" },
        modal: { ondismiss: () => setIsProcessing(false) },
        handler: async (paymentResponse) => {
          try {
            const verificationResponse = await fetch(`${API_URL}/payments/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...paymentResponse, orderRecord: razorpayOrder.orderRecord }),
            });
            const verification = await verificationResponse.json().catch(() => ({}));
            if (!verificationResponse.ok) throw new Error(verification.message || "Payment could not be verified");

            saveOrderLocally(verification.order);
            clearCart();
            alert(`Payment successful and order placed.\nAmount: ${totalPriceInrLabel}`);
          } catch (error) {
            setPaymentError(`${error.message}. Payment reference: ${paymentResponse.razorpay_payment_id}`);
          } finally {
            setIsProcessing(false);
          }
        },
      });

      checkout.on("payment.failed", (event) => {
        setPaymentError(event.error?.description || "Payment failed. No order was placed.");
        setIsProcessing(false);
      });
      checkout.open();
    } catch (error) {
      setPaymentError(error.message || "Could not start payment");
      setIsProcessing(false);
    }
  };

  return (
    <section className="w-full max-w-300 mx-auto px-4 py-8 sm:px-5 sm:py-10">

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
                        width="80"
                        height="80"
                        loading="lazy"
                        decoding="async"
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
                        className="w-9 h-9 bg-orange-700 text-white rounded-lg font-bold text-xl"
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
        <div className="bg-zinc-100 p-4 sm:p-6 rounded-xl text-zinc-900">

          <h2 className="text-2xl font-bold mb-6">
            Payment Details
          </h2>

          <form onSubmit={handlePayment}>

            {/* Name */}
            <label htmlFor="checkout-name" className="sr-only">Full name</label>
            <input
              type="text"
              id="checkout-name"
              name="name"
              value={userDetails.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-3 mb-4 rounded-lg outline-none text-zinc-900"
            />

            {/* Email */}
            <label htmlFor="checkout-email" className="sr-only">Email address</label>
            <input
              type="email"
              id="checkout-email"
              name="email"
              value={userDetails.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 mb-4 rounded-lg outline-none text-zinc-900"
            />

            {/* Delivery Address */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-zinc-900">
              <label htmlFor="checkout-house" className="sr-only">House number</label>
              <input required id="checkout-house" name="houseNo" value={userDetails.houseNo} onChange={handleChange} placeholder="House No." className="w-full p-3 rounded-lg outline-none text-zinc-900" />
              <label htmlFor="checkout-sector" className="sr-only">Sector or colony</label>
              <input required id="checkout-sector" name="sectorColony" value={userDetails.sectorColony} onChange={handleChange} placeholder="Sector / Colony" className="w-full p-3 rounded-lg outline-none text-zinc-900" />
              <label htmlFor="checkout-district" className="sr-only">District</label>
              <input required id="checkout-district" name="district" value={userDetails.district} onChange={handleChange} placeholder="District" className="w-full p-3 rounded-lg outline-none text-zinc-900" />
              <label htmlFor="checkout-state" className="sr-only">State</label>
              <input required id="checkout-state" name="state" value={userDetails.state} onChange={handleChange} placeholder="State" className="w-full p-3 rounded-lg outline-none text-zinc-900" />
            </div>

            {/* Payment Method */}
            <h3 className="font-bold text-lg mb-3">
              Select Payment Method
            </h3>

            {onlinePaymentsEnabled ? (
              <>
                <label className="flex items-center gap-3 bg-white p-3 rounded-lg mb-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentType === "UPI"}
                    onChange={(event) => setPaymentType(event.target.value)}
                  />
                  <span>UPI</span>
                </label>

                <label className="flex items-center gap-3 bg-white p-3 rounded-lg mb-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="Credit/Debit Card"
                    checked={paymentType === "Credit/Debit Card"}
                    onChange={(event) => setPaymentType(event.target.value)}
                  />
                  <span>Credit / Debit Card</span>
                </label>
              </>
            ) : (
              <p role="status" className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                Online payments are temporarily unavailable. You can still place a Cash on Delivery order.
              </p>
            )}

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

            {paymentType && paymentType !== "Cash on Delivery" && (
              <p className="mt-5 rounded-xl bg-white p-4 text-sm text-slate-700">
                Secure Razorpay checkout will open. UPI apps shown depend on your device and Razorpay account settings.
              </p>
            )}

            {paymentError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{paymentError}</p>}

            <div className="mt-5 rounded-2xl bg-white p-3 text-sm text-slate-600">
              <p>Bill amount in INR: <span className="font-bold text-slate-900">{totalPriceInrLabel}</span></p>
            </div>

            <button
              type="submit"
              disabled={isProcessing || cartItems.length === 0}
              aria-busy={isProcessing}
              className="mt-5 w-full bg-orange-700 hover:bg-orange-800 text-white py-3 rounded-lg font-bold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? "Processing payment..." : paymentType === "Cash on Delivery" ? "Place order" : `Pay ${totalPriceInrLabel}`}
            </button>

          </form>

        </div>

      </div>
    </section>
  );
};

export default Payment;
