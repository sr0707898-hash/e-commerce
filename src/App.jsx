import Home from "../src/commponente/Home pages/home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Fruits from "./commponente/fruits/fruits";
import Dairy from "./commponente/dairy/dairy";
import Seefood from "./commponente/seefood/seefood";
import Allproducts from "./commponente/allproducts/allproducts";
import Layout from "./commponente/Layout/layout";
import Login from "./commponente/login/login";
import Register from "./commponente/Register/Register";
import Checkout from "./commponente/payment/payment";
import CardContextProvider from "./commponente/cardcontext/cardcontext";
import Cart from "./commponente/carts/carts";
import SelectedItems from "./commponente/selectitems/selectitems";
import Dashboard from "./commponente/dashboard/dashboard";
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
        }

        
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
     element: <CardContextProvider />
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

    
  
  ]);
  return <RouterProvider router={router} />;
  
  

}

export default App;
