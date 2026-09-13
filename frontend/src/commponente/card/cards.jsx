
import { useContext, useState } from "react";
import { FaHeart, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Button from "../buttion/button";
import { CartContext } from "../cardcontext/cartContext";

const Cards = ({ id, image, name, price }) => {
  const { addToCart } = useContext(CartContext);

  const [selected, setSelected] = useState(false);

  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart({
      id,
      image,
      name,
      price: Number(price),
    });

    setSelected(true);
  };

  const handlePayment = () => {
    navigate("/payment");
  };

  const handleShopNow = () => {
    handleAddToCart();
    navigate("/payment");
  };

  return (
    <div className="bg-zinc-100 p-5 rounded-xl">

      {/* Top */}
      <div className="flex justify-between">

        <span className="text-3xl text-zinc-300">
          <FaHeart />
        </span>

        <button
          onClick={handleAddToCart}
          className="px-4 py-3 rounded-lg bg-white hover:bg-orange-500 hover:text-white"
        >
          <FaPlus />
        </button>

      </div>

      {/* Image */}
      <div className="w-full h-50">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-contain mx-auto"
        />
      </div>

      {/* Product */}
      <div className="text-center">

        <h3 className="text-2xl font-bold">
          {name}
        </h3>

        <p className="text-2xl font-bold mt-4 mb-3">
          ${Number(price).toFixed(2)}
        </p>

        {/* Select hone ke baad */}
        {selected ? (
          <div>

            <p className="text-green-600 font-bold mb-3">
              ✓ Item Selected Successfully!
            </p>

            <button
              onClick={handlePayment}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
            >
              Go to Payment
            </button>

          </div>
        ) : (
          <Button content="Shop Now" onClick={handleShopNow} />
        )}

      </div>

    </div>
  );
};

export default Cards;

