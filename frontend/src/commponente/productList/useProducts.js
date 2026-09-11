import { useEffect, useState } from "react";
import fallbackProducts from "./productList";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CATALOG_OVERRIDES_KEY = "grocify_catalog_overrides";

const getCatalogOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(CATALOG_OVERRIDES_KEY) || "{}");
  } catch {
    return {};
  }
};

const applyCatalogOverrides = (products) => {
  const overrides = getCatalogOverrides();
  const deletedNames = new Set(overrides.deletedNames || []);
  return products
    .filter((product) => !deletedNames.has(product.name))
    .map((product) => ({ ...product, ...(overrides.editedProducts?.[product.name] || {}) }));
};

const useProducts = () => {
  const [products, setProducts] = useState(() => applyCatalogOverrides(fallbackProducts));

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/products`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Could not load products"))))
      .then((data) => {
        if (!active) return;

        const apiProducts = Array.isArray(data?.products) ? data.products.map((product) => ({
          ...product,
          id: product._id || product.id,
          image: product.image || product.img || "",
        })) : [];

        const mergedProducts = applyCatalogOverrides([
          ...apiProducts,
          ...fallbackProducts.filter((fallbackProduct) =>
            !apiProducts.some((apiProduct) => apiProduct.name === fallbackProduct.name)
          )
        ]);

        setProducts(mergedProducts.length ? mergedProducts : fallbackProducts);
      })
      .catch(() => {
        setProducts(applyCatalogOverrides(fallbackProducts));
      });

    return () => {
      active = false;
    };
  }, []);

  return products;
};

export default useProducts;