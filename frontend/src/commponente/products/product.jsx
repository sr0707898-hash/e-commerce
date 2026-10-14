import { useState } from "react";
import Heading from "../heading/heading";
import useProducts from "../productList/useProducts";
import Cards from "../card/cards";
import { Link } from "react-router-dom";

const PAGE_SIZE = 8;

const Product = () => {

  const categories = [
    "All",
    "Fruits",
    "Vegetables",
    "Dairy",
    "Seafood"
  ];

  const [activeTab, setActivTab] = useState("All");
  const [pagination, setPagination] = useState({ category: "", page: 1 });
  const products = useProducts();

  const filteredItems =
    activeTab === "All"
      ? products
      : products.filter(
          (item) => item.category === activeTab
        );

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const currentPage = pagination.category === activeTab ? pagination.page : 1;
  const displayedPage = Math.min(currentPage, totalPages || 1);
  const pageItems = filteredItems.slice((displayedPage - 1) * PAGE_SIZE, displayedPage * PAGE_SIZE);

  const renderCards = pageItems.map((product) => (
      <Cards
        key={product.id}
        id={product.id}
        image={product.image}
        name={product.name}
        price={product.price}
      />
  ));

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
                    ? "bg-orange-700 text-white"
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

        {totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Home product pagination">
            <button
              type="button"
              onClick={() => setPagination({ category: activeTab, page: Math.max(1, displayedPage - 1) })}
              disabled={displayedPage === 1}
              className="rounded border border-zinc-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setPagination({ category: activeTab, page })}
                aria-current={displayedPage === page ? "page" : undefined}
                aria-label={`Go to page ${page}`}
                className={`size-10 rounded border px-3 py-2 ${displayedPage === page ? "border-orange-700 bg-orange-700 text-white" : "border-zinc-300 hover:border-orange-700"}`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPagination({ category: activeTab, page: Math.min(totalPages, displayedPage + 1) })}
              disabled={displayedPage === totalPages}
              className="rounded border border-zinc-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        )}

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

