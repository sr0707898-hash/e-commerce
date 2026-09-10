import { useState } from "react";
import Heading from "../heading/heading";
import useProducts from "../productList/useProducts";
import Cards from "../card/cards";
import { Link } from "react-router-dom";

const Product = () => {

  const categories = [
    "All",
    "Fruits",
    "Vegetables",
    "Dairy",
    "Seafood"
  ];

  const [activeTab, setActivTab] = useState("All");
  const products = useProducts();

  const fiterItems =
    activeTab === "All"
      ? products
      : products.filter(
          (item) => item.category === activeTab
        );

  const renderCards = fiterItems.slice(0, 8).map((product) => {
    return (
      <Cards
        key={product.id}
        id={product.id}
        image={product.image}
        name={product.name}
        price={product.price}
      />
    );
  });

  return (
    <section>

      <div className="max-w-350 mx-auto px-10 py-20">

        <Heading
          highlight="Our"
          heading="Products"
        />

        {/* Categories */}
        <div className="flex flex-wrap gap-3 justify-center mt-10">

          {categories.map((category) => {
            return (
              <button
                key={category}
                className={`px-5 py-2 text-lg rounded-lg ${
                  activeTab === category
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-100"
                }`}
                onClick={() => setActivTab(category)}
              >
                {category}
              </button>
            );
          })}

        </div>

        {/* Products */}
        <div className="grid grid-cols-1 md:grid-cols-4 mt-20 gap-9">
          {renderCards}
        </div>

        {/* View All */}
        <div className="mt-15 mx-auto w-fit">

          <Link
            to="/allproducts"
            className="bg-red-500 text-white px-8 py-3 rounded-lg hover:scale-105 hover:bg-red-600 cursor-pointer"
          >
            View All
          </Link>

        </div>

      </div>

    </section>
  );
};

export default Product;

