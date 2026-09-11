import { Link } from "react-router-dom";

const ProductsPage = () => {
  const products = JSON.parse(localStorage.getItem("grocify_products") || "[]");

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Catalog</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Product list</h1>
          </div>
          <Link to="/dashboard" className="rounded-xl bg-[#10251f] px-4 py-2 font-semibold text-white hover:bg-[#1d4437]">
            Dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
              No products saved yet. Add products from the dashboard.
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
