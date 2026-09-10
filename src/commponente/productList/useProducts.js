import { useEffect, useState } from "react";
import fallbackProducts from "./productList";

const API_URL = "http://localhost:5000";

const useProducts = () => {
  const [products, setProducts] = useState(fallbackProducts);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/products`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Could not load products"))))
      .then((data) => {
        if (!active) return;
        const apiProducts = data.products.map((product) => ({
          ...product,
          id: product._id,
        }));
        setProducts([...apiProducts, ...fallbackProducts]);
      })
      .catch(() => {
        // Keep the bundled catalog available when the API is offline.
      });

    return () => {
      active = false;
    };
  }, []);

  return products;
};

export default useProducts;