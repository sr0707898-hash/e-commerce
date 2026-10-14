import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./commponente/Layout/layout";
import CartContextProvider from "./commponente/cardcontext/cardcontext";

const Home = lazy(() => import("../src/commponente/Home pages/home"));
const Fruits = lazy(() => import("./commponente/fruits/fruits"));
const Dairy = lazy(() => import("./commponente/dairy/dairy"));
const Seefood = lazy(() => import("./commponente/seefood/seefood"));
const Allproducts = lazy(() => import("./commponente/allproducts/allproducts"));
const Login = lazy(() => import("./commponente/login/login"));
const Register = lazy(() => import("./commponente/Register/Register"));
const Checkout = lazy(() => import("./commponente/payment/payment"));
const Cart = lazy(() => import("./commponente/carts/carts"));
const SelectedItems = lazy(() => import("./commponente/selectitems/selectitems"));
const Dashboard = lazy(() => import("./commponente/dashboard/dashboard"));
const OrderDetails = lazy(() => import("./commponente/dashboard/orderDetails"));
const OrdersPage = lazy(() => import("./commponente/dashboard/ordersPage"));
const ProductsPage = lazy(() => import("./commponente/dashboard/productsPage"));
const AdminOrdersPage = lazy(() => import("./commponente/dashboard/adminOrdersPage"));
const SettingsPage = lazy(() => import("./commponente/dashboard/settingsPage"));
const ProgressPage = lazy(() => import("./commponente/progress/progressPage"));
const PaymentsPage = lazy(() => import("./commponente/dashboard/paymentsPage"));

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/fruits",
          element: <Fruits />,
        },
        {
          path: "/dairy",
          element: <Dairy />,
        },
        {
          path: "/seefood",
          element: <Seefood />,
        },
        {
          path: "/allproducts",
          element: <Allproducts />,
        },
        {
          path: "/progress",
          element: <ProgressPage />,
        },

        
      ]
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/Register",
     element: <Register />
    },
    {
      path: "/cardcontext",
    element: <CartContextProvider />
    },
    {
      path: "/payment",
     element: <Checkout />
    },
    {
      path: "/carts",
     element: <Cart />
    },
    {
      path: "/selectitems",
     element: <SelectedItems />
    },
    {
      path: "/dashboard",
      element: <Dashboard />
    },
    {
      path: "/dashboard/orders/:orderId",
      element: <OrderDetails />
    },
    {
      path: "/dashboard/orders",
      element: <AdminOrdersPage />
    },
    {
      path: "/dashboard/payments",
      element: <PaymentsPage />
    },
    {
      path: "/dashboard/products",
      element: <ProductsPage />
    },
    {
      path: "/dashboard/settings",
      element: <SettingsPage />
    },
    {
      path: "/orders/:orderId",
      element: <OrderDetails />
    },
    {
      path: "/orders",
      element: <OrdersPage />
    },

    
  
  ]);
  return (
    <Suspense fallback={<main className="p-8 text-center" role="status">Loading page...</main>}>
      <RouterProvider router={router} />
    </Suspense>
  );
  
  

}

export default App;
