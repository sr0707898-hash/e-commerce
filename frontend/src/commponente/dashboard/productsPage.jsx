import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import fallbackProducts from "../productList/productList";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
const CATALOG_OVERRIDES_KEY = "grocify_catalog_overrides";

const getCatalogOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(CATALOG_OVERRIDES_KEY) || "{}");
  } catch {
    return {};
  }
};

const applyCatalogOverrides = (items) => {
  const overrides = getCatalogOverrides();
  const deletedNames = new Set(overrides.deletedNames || []);

  return items
    .filter((product) => !deletedNames.has(product.name))
    .map((product) => ({
      ...product,
      ...(overrides.editedProducts?.[product.name] || {}),
    }));
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [productForm, setProductForm] = useState({ name: "", category: "Fruits", price: "", stock: "", image: "" });

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/dashboard");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/admin/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!active) return;

        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/dashboard");
          return;
        }
        if (!response.ok) throw new Error(data.message || "Could not load products");

        const apiProducts = Array.isArray(data.products) ? data.products : [];
        const mergedProducts = applyCatalogOverrides([
          ...apiProducts,
          ...fallbackProducts.filter((fallbackProduct) => !apiProducts.some((apiProduct) => apiProduct.name === fallbackProduct.name)),
        ]);
        const productsToShow = mergedProducts.length ? mergedProducts : fallbackProducts;

        setProducts(productsToShow);
        localStorage.setItem("grocify_products", JSON.stringify(productsToShow));
      } catch (loadError) {
        if (!active) return;
        const fallbackItems = applyCatalogOverrides(fallbackProducts);
        setError(loadError.message || "Could not load products");
        setProducts(fallbackItems);
        localStorage.setItem("grocify_products", JSON.stringify(fallbackItems));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadProducts();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleImageFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProductForm((current) => ({ ...current, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setProductForm({ name: "", category: "Fruits", price: "", stock: "", image: "" });
    setShowForm(true);
    setError("");
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      category: product.category || "Fruits",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image: product.image || "",
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("adminToken");
    const payload = {
      ...productForm,
      image: productForm.image.trim(),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
    };

    if (editingProduct && !editingProduct._id) {
      const overrides = getCatalogOverrides();
      overrides.editedProducts = { ...(overrides.editedProducts || {}) };
      overrides.editedProducts[editingProduct.name] = {
        ...editingProduct,
        name: payload.name,
        category: payload.category,
        price: payload.price,
        stock: payload.stock,
        image: payload.image,
      };
      localStorage.setItem(CATALOG_OVERRIDES_KEY, JSON.stringify(overrides));
      setProducts((current) =>
        current.map((item) => {
          const itemKey = item._id || item.name;
          const editingKey = editingProduct._id || editingProduct.name;
          return itemKey === editingKey ? { ...item, ...payload, name: payload.name } : item;
        })
      );
      setMessage(`${payload.name} updated successfully.`);
      setShowForm(false);
      setEditingProduct(null);
      setProductForm({ name: "", category: "Fruits", price: "", stock: "", image: "" });
      return;
    }

    if (!token) {
      navigate("/dashboard");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/admin/products${editingProduct ? `/${editingProduct._id}` : ""}`, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/dashboard");
        return;
      }
      if (!response.ok) throw new Error(data.message || "Could not save product");

      setProducts((current) => {
        const updatedList = editingProduct
          ? current.map((item) => (item._id === data.product._id ? data.product : item))
          : [data.product, ...current];
        localStorage.setItem("grocify_products", JSON.stringify(updatedList));
        return updatedList;
      });
      setMessage(`${data.product.name} ${editingProduct ? "updated" : "added"} successfully.`);
      setShowForm(false);
      setEditingProduct(null);
      setProductForm({ name: "", category: "Fruits", price: "", stock: "", image: "" });
    } catch (submitError) {
      setError(submitError.message || "Could not save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;

    if (!product._id) {
      const overrides = getCatalogOverrides();
      overrides.deletedNames = [...new Set([...(overrides.deletedNames || []), product.name])];
      localStorage.setItem(CATALOG_OVERRIDES_KEY, JSON.stringify(overrides));
      const updated = products.filter((item) => (item._id || item.name) !== (product._id || product.name));
      setProducts(updated);
      localStorage.setItem("grocify_products", JSON.stringify(updated));
      setMessage(`${product.name} removed from catalog.`);
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/dashboard");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/products/${product._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/dashboard");
        return;
      }
      if (!response.ok) throw new Error(data.message || "Could not delete product");
      const updated = products.filter((item) => item._id !== product._id);
      setProducts(updated);
      localStorage.setItem("grocify_products", JSON.stringify(updated));
      setMessage(`${product.name} deleted successfully.`);
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete product");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/dashboard" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Back to dashboard</Link>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Catalog</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">All products</h1>
          </div>
          <button onClick={openAddForm} className="rounded-xl bg-[#10251f] px-4 py-2 font-semibold text-white hover:bg-[#1d4437]">
            Add product
          </button>
        </div>

        {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading products...</div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
                No products added yet.
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id || product.id || product.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl text-orange-300">🍏</span>
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-slate-900">{product.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">{product.category}</p>
                    </div>
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">{product.stock} left</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-900">₹{Number(product.price || 0).toLocaleString("en-IN")}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <button type="button" onClick={() => openEditForm(product)} className="flex-1 rounded-lg bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-200">Edit</button>
                    <button type="button" onClick={() => handleDelete(product)} className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{editingProduct ? "Edit product" : "Add product"}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-800">✕</button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label htmlFor="product-name" className="sr-only">Product name</label>
              <input id="product-name" required placeholder="Product name" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2" />
              <label htmlFor="product-category" className="sr-only">Product category</label>
              <select id="product-category" value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5">
                <option>Fruits</option>
                <option>Vegetables</option>
                <option>Dairy</option>
                <option>Seafood</option>
              </select>
              <label htmlFor="product-price" className="sr-only">Product price</label>
              <input id="product-price" required min="0" step="0.01" type="number" placeholder="Price" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5" />
              <label htmlFor="product-stock" className="sr-only">Product stock</label>
              <input id="product-stock" required min="0" type="number" placeholder="Stock" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5" />
              <label className="rounded-xl border border-dashed border-orange-300 bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-700 sm:col-span-2">
                Choose image from computer
                <input type="file" accept="image/*" onChange={handleImageFile} className="mt-2 block w-full text-sm font-normal text-slate-600" />
              </label>
              <label htmlFor="product-image-url" className="sr-only">Product image URL</label>
              <input id="product-image-url" type="url" placeholder="Or paste direct image URL" value={productForm.image.startsWith("data:") ? "" : productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2" />
              {productForm.image && <img src={productForm.image} alt="Preview" className="h-24 w-full rounded-xl object-cover sm:col-span-2" />}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
              <button type="submit" disabled={isSaving} className="rounded-xl bg-[#10251f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4437] disabled:opacity-70">
                {isSaving ? "Saving..." : editingProduct ? "Update product" : "Save product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
