import { useEffect, useState } from "react";
import fallbackProducts from "./productList";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
const CATALOG_OVERRIDES_KEY = "grocify_catalog_overrides";
let productsRequest;

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

const fetchProducts = () => {
  if (!productsRequest) {
    productsRequest = fetch(`${API_URL}/products`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Could not load products"))))
      .then((data) => Array.isArray(data?.products) ? data.products.map((product) => ({
        ...product,
        id: product._id || product.id,
        image: product.image || product.img || "",
      })) : [])
      .finally(() => {
        productsRequest = undefined;
      });
  }

  return productsRequest;
};

const useProducts = () => {
  const [products, setProducts] = useState(() => applyCatalogOverrides(fallbackProducts));

  useEffect(() => {
    let active = true;

    fetchProducts()
      .then((apiProducts) => {
        if (!active) return;

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