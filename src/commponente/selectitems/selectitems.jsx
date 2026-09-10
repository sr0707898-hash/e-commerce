
import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../cardcontext/cartContext";

const SelectedItems = () => {
  const { cartItems } = useContext(CartContext);

  return (
    <div className="max-w-[1000px] mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8">Selected Items</h1>

      {cartItems.length === 0 ? (
        <p>No item selected.</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-zinc-100 p-5 rounded-xl mb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  className="w-20 h-20 object-contain"
                />
                <div>
                  <h2 className="font-bold text-xl">{item.name}</h2>
                  <p>${Number(item.price).toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/payment"
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg"
          >
            Go to Payment
          </Link>
        </>
      )}
    </div>
  );
};

export default SelectedItems;

