import { useState,useEffect,useContext } from "react";
import {IoMdContact} from "react-icons/io";
import {FiGrid, FiSearch, FiShoppingBag, FiHeart, FiMenu, FiX} from "react-icons/fi";
import {Link,useNavigate} from "react-router-dom";
import useProducts from "../productList/useProducts";
import {CartContext} from "../cardcontext/cartContext";
import { getProjectSettings } from "../dashboard/projectSettings";

const Search=({mobile,searchText,setSearchText,filteredProducts,productClick})=>(
 <div className={`relative ${mobile?"flex-1 min-w-0":"w-55 xl:w-80"}`}>
  <div className="flex items-center border-2 border-orange-500 rounded-full p-1 w-full bg-white">
   <label htmlFor={mobile ? "mobile-product-search" : "desktop-product-search"} className="sr-only">Search products</label>
   <input
    id={mobile ? "mobile-product-search" : "desktop-product-search"}
    type="text"
    value={searchText}
    onChange={e=>setSearchText(e.target.value)}
    className="flex-1 min-w-0 w-full px-2 py-2 outline-none bg-transparent"
    placeholder="Search..."
   />
  <button type="button" aria-label="Submit product search" className="shrink-0 bg-orange-700 text-white w-9 h-9 rounded-full flex items-center justify-center">
   <FiSearch aria-hidden="true" />
   </button>
  </div>

  {searchText&&filteredProducts.length>0&&(
   <div className="absolute top-14 left-0 w-70 max-w-[90vw] bg-white shadow-xl rounded-lg overflow-hidden z-100">
    {filteredProducts.slice(0,6).map(p=>(
     <div key={p.id} onClick={()=>productClick(p)} className="flex gap-3 p-3 hover:bg-orange-100 cursor-pointer">
      <img src={p.image} alt={p.name} width="48" height="48" loading="lazy" decoding="async" className="w-12 h-12 object-contain"/>
      <div>
       <p className="font-bold">{p.name}</p>
       <p className="text-sm text-gray-500">{p.hindiName}</p>
      <p className="text-orange-700">${Number(p.price).toFixed(2)}</p>
      </div>
     </div>
    ))}
   </div>
  )}
 </div>
);

const Cart = ({ cartItems }) => (
 <Link to="/payment" aria-label="Shopping cart" className="relative shrink-0">
  <FiShoppingBag aria-hidden="true" className="text-xl" />
  {cartItems?.length>0&&(
   <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
    {cartItems.length}
   </span>
  )}
 </Link>
);

const Navbar=()=>{
 const [showMenu,setShowMenu]=useState(false);
 const [isScrolled,setIsScrolled]=useState(false);
 const [searchText,setSearchText]=useState("");
 const [currentUser,setCurrentUser]=useState(()=>JSON.parse(localStorage.getItem("user") || "null"));
 const [isAdmin,setIsAdmin]=useState(()=>Boolean(localStorage.getItem("adminToken") && !localStorage.getItem("user")));
 const [projectSettings,setProjectSettings]=useState(getProjectSettings);
 const [showLoginNotice,setShowLoginNotice]=useState(()=>!localStorage.getItem("user")&&!sessionStorage.getItem("loginNoticeClosed"));
 const getUserOrderCount = () => {
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  if (!savedUser?.email) return 0;
  const orders = JSON.parse(localStorage.getItem("grocify_orders") || "[]");
  return orders.filter((order) => order.email?.toLowerCase() === savedUser.email.toLowerCase() || order.customer === savedUser.name).length;
 };
 const [orderCount,setOrderCount]=useState(getUserOrderCount);
 const {cartItems}=useContext(CartContext);
 const navigate=useNavigate();

 useEffect(()=>{
  const scroll=()=>setIsScrolled(window.scrollY>10);
  window.addEventListener("scroll",scroll);
  return()=>window.removeEventListener("scroll",scroll);
 },[]);

 useEffect(()=>{
  const updateOrderCount=()=>setOrderCount(getUserOrderCount());
  window.addEventListener("storage",updateOrderCount);
  window.addEventListener("ordersUpdated",updateOrderCount);
  return()=>{
   window.removeEventListener("storage",updateOrderCount);
   window.removeEventListener("ordersUpdated",updateOrderCount);
  };
 },[]);

 useEffect(()=>{
  const updateUser=()=>{
   const user=JSON.parse(localStorage.getItem("user") || "null");
   setCurrentUser(user);
   setIsAdmin(Boolean(localStorage.getItem("adminToken") && !user));
  };
  window.addEventListener("storage",updateUser);
  window.addEventListener("authUpdated",updateUser);
  return()=>{
   window.removeEventListener("storage",updateUser);
   window.removeEventListener("authUpdated",updateUser);
  };
 },[]);

 useEffect(()=>{
  const syncAdminStatus=()=>setIsAdmin(Boolean(localStorage.getItem("adminToken") && !localStorage.getItem("user")));
  window.addEventListener("storage",syncAdminStatus);
  window.addEventListener("adminAuthUpdated",syncAdminStatus);
  return()=>{
   window.removeEventListener("storage",syncAdminStatus);
   window.removeEventListener("adminAuthUpdated",syncAdminStatus);
  };
 },[]);

 useEffect(()=>{
  const syncProjectSettings=()=>setProjectSettings(getProjectSettings());
  window.addEventListener("projectSettingsUpdated",syncProjectSettings);
  return()=>window.removeEventListener("projectSettingsUpdated",syncProjectSettings);
 },[]);

 const products = useProducts();
 const filteredProducts=products.filter(item=>{
  const s=searchText.toLowerCase().trim();
  return s&&(item.name?.toLowerCase().includes(s)||item.hindiName?.toLowerCase().includes(s));
 });

 const productClick=p=>{
  setSearchText("");
  setShowMenu(false);
  navigate("/allproducts",{state:{searchProduct:p.name}});
 };

 const closeLoginNotice=()=>{
  sessionStorage.setItem("loginNoticeClosed","true");
  setShowLoginNotice(false);
 };

 const handleLogout=()=>{
  localStorage.removeItem("user");
  sessionStorage.removeItem("loginNoticeClosed");
  setCurrentUser(null);
  setOrderCount(0);
  setShowLoginNotice(true);
  window.dispatchEvent(new Event("authUpdated"));
  navigate("/");
 };

 return(
  <header className={`fixed top-0 left-0 right-0 bg-white z-50 ${isScrolled?"shadow-lg":"shadow-sm"}`}>

    <nav className="mx-auto flex min-h-18.75 max-w-350 flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6 lg:min-h-22.5 lg:flex-nowrap lg:px-10">

    <Link to="/" className="shrink-0 text-xl font-bold sm:text-2xl md:text-4xl lg:mr-auto">
     {projectSettings.storeName}
    </Link>

    <ul className="hidden lg:flex items-center gap-6 xl:gap-10 mx-auto">
    <li><Link to="/" className="font-semibold hover:text-orange-700">Home</Link></li>
    <li><a href="#about" className="font-semibold hover:text-orange-700">About Us</a></li>
    <li><a href="#process" className="font-semibold hover:text-orange-700">Process</a></li>
    <li><a href="#contact" className="font-semibold hover:text-orange-700">Contact Us</a></li>
      <li><Link to="/progress" className="font-semibold hover:text-orange-700">Our progress</Link></li>
    {(isAdmin||!currentUser)&&<li><Link to="/dashboard" aria-label="Admin dashboard" title="Admin dashboard" className="flex h-10 w-10 items-center justify-center rounded-lg text-xl hover:bg-orange-50 hover:text-orange-600"><FiGrid /></Link></li>}
    </ul>

    <div className="hidden items-center gap-5 lg:ml-auto lg:flex">
     <Search
      searchText={searchText}
      setSearchText={setSearchText}
      filteredProducts={filteredProducts}
      productClick={productClick}
     />

    <Link to="/orders" className="relative" aria-label="My orders">
      <FiHeart aria-hidden="true" className="text-xl" />
     {orderCount>0&&<span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{orderCount}</span>}
     </Link>

    <Cart cartItems={cartItems}/>

    {currentUser ? <button type="button" onClick={handleLogout} className="h-10 px-4 flex items-center gap-1 border-2 bg-red-100 text-red-700 hover:bg-red-700 hover:text-white rounded-full"><IoMdContact className="text-2xl"/>Logout</button> : <Link to="/login"><button className="h-10 px-4 flex items-center gap-1 border-2 bg-blue-100 hover:bg-blue-700 hover:text-white rounded-full"><IoMdContact className="text-2xl"/>Login</button></Link>}
    </div>

    <div className="ml-auto flex shrink-0 items-center gap-3 lg:hidden">

      <Link to="/orders" className="relative" aria-label="My orders">
      <FiHeart aria-hidden="true" className="text-xl" />
      {orderCount>0&&<span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{orderCount}</span>}
     </Link>

    <Cart cartItems={cartItems}/>

    <button type="button" aria-label={showMenu ? "Close menu" : "Open menu"} onClick={()=>setShowMenu(!showMenu)} className="text-2xl sm:text-3xl shrink-0 cursor-pointer">
     {showMenu ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
     </button>
    </div>

    <div className="w-full lg:hidden">
     <Search
      mobile
      searchText={searchText}
      setSearchText={setSearchText}
      filteredProducts={filteredProducts}
      productClick={productClick}
     />
    </div>
   </nav>

   {showMenu&&(
    <div className="lg:hidden bg-white border-t shadow-lg p-5">
     <div className="flex flex-col gap-4">
      <Link to="/" onClick={()=>setShowMenu(false)}>Home</Link>
      <a href="#about" onClick={()=>setShowMenu(false)}>About Us</a>
      <a href="#process" onClick={()=>setShowMenu(false)}>Process</a>
      <a href="#contact" onClick={()=>setShowMenu(false)}>Contact Us</a>
      <Link to="/progress" onClick={()=>setShowMenu(false)}>Our progress</Link>
      {(isAdmin||!currentUser)&&<Link to="/dashboard" aria-label="Admin dashboard" onClick={()=>setShowMenu(false)} className="flex items-center gap-2"><FiGrid />Admin dashboard</Link>}



      {currentUser ? <button type="button" onClick={()=>{ handleLogout(); setShowMenu(false); }} className="w-full h-10 flex items-center justify-center gap-1 border-2 bg-red-100 text-red-700 hover:bg-red-700 hover:text-white rounded-full"><IoMdContact className="text-2xl"/>Logout</button> : <Link to="/login" onClick={()=>setShowMenu(false)}><button className="w-full h-10 flex items-center justify-center gap-1 border-2 bg-blue-100 hover:bg-blue-700 hover:text-white rounded-full"><IoMdContact className="text-2xl"/>Login</button></Link>}
     </div>
    </div>
   )}

    {showLoginNotice&&(
     <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
      <button type="button" onClick={closeLoginNotice} aria-label="Close login message" className="absolute right-4 top-3 text-xl text-slate-400 hover:text-slate-700">&times;</button>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">Login required</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">Please login before ordering</h2>
      <p className="mt-2 text-sm text-slate-500">You can browse the store, but an account is required to place an order.</p>
      <Link to="/login" onClick={closeLoginNotice} className="mt-5 inline-block rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white hover:bg-orange-800">Login now</Link>
      </div>
     </div>
    )}
  </header>
 );
};

export default Navbar;
