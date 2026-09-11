import { useState,useEffect,useContext } from "react";
import {IoMdContact} from "react-icons/io";
import {Link,useNavigate} from "react-router-dom";
import useProducts from "../productList/useProducts";
import {CartContext} from "../cardcontext/cartContext";

const Search=({mobile,searchText,setSearchText,filteredProducts,productClick})=>(
 <div className={`relative ${mobile?"flex-1 min-w-0":"w-55 xl:w-80"}`}>
  <div className="flex items-center border-2 border-orange-500 rounded-full p-1 w-full bg-white">
   <input
    type="text"
    value={searchText}
    onChange={e=>setSearchText(e.target.value)}
    className="flex-1 min-w-0 w-full px-2 py-2 outline-none bg-transparent"
    placeholder="Search..."
   />
   <button type="button" className="shrink-0 bg-orange-500 text-white w-9 h-9 rounded-full flex items-center justify-center">
    <i className="bi bi-search"></i>
   </button>
  </div>

  {searchText&&filteredProducts.length>0&&(
   <div className="absolute top-14 left-0 w-70 max-w-[90vw] bg-white shadow-xl rounded-lg overflow-hidden z-100">
    {filteredProducts.slice(0,6).map(p=>(
     <div key={p.id} onClick={()=>productClick(p)} className="flex gap-3 p-3 hover:bg-orange-100 cursor-pointer">
      <img src={p.image} alt={p.name} className="w-12 h-12 object-contain"/>
      <div>
       <p className="font-bold">{p.name}</p>
       <p className="text-sm text-gray-500">{p.hindiName}</p>
       <p className="text-orange-500">${Number(p.price).toFixed(2)}</p>
      </div>
     </div>
    ))}
   </div>
  )}
 </div>
);

const Cart = ({ cartItems }) => (
 <Link to="/payment" className="relative shrink-0">
  <i className="bi bi-bag-check-fill text-xl"></i>
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
 const {cartItems}=useContext(CartContext);
 const navigate=useNavigate();

 useEffect(()=>{
  const scroll=()=>setIsScrolled(window.scrollY>10);
  window.addEventListener("scroll",scroll);
  return()=>window.removeEventListener("scroll",scroll);
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

 return(
  <header className={`fixed top-0 left-0 right-0 bg-white z-50 ${isScrolled?"shadow-lg":"shadow-sm"}`}>

    <nav className="max-w-350 mx-auto px-3 sm:px-6 lg:px-10 min-h-18.75 md:min-h-22.5 py-3 flex items-center gap-2 sm:gap-3">

    <Link to="/" className="text-xl sm:text-2xl md:text-4xl font-bold shrink-0">
     Gr<span className="text-orange-500">O</span>cify
    </Link>

    <ul className="hidden lg:flex items-center gap-6 xl:gap-10 mx-auto">
     <li><Link to="/" className="font-semibold hover:text-orange-500">Home</Link></li>
     <li><a href="#about" className="font-semibold hover:text-orange-500">About Us</a></li>
     <li><a href="#process" className="font-semibold hover:text-orange-500">Process</a></li>
     <li><a href="#contact" className="font-semibold hover:text-orange-500">Contact Us</a></li>
    </ul>

    <div className="hidden lg:flex items-center gap-5 ml-auto">
     <Search
      searchText={searchText}
      setSearchText={setSearchText}
      filteredProducts={filteredProducts}
      productClick={productClick}
     />

     <Link to="/selectitems">
      <i className="bi bi-heart-fill text-xl"></i>
     </Link>

    <Cart cartItems={cartItems}/>

     <Link to="/login">
      <button className="h-10 px-4 flex items-center gap-1 border-2 bg-blue-100 hover:bg-blue-500 hover:text-white rounded-full">
       <IoMdContact className="text-2xl"/>
       Login
      </button>
     </Link>
    </div>

    <div className="flex lg:hidden items-center gap-2 flex-1 min-w-0 justify-end">

     <Search
      mobile
      searchText={searchText}
      setSearchText={setSearchText}
      filteredProducts={filteredProducts}
      productClick={productClick}
     />

      <Link to="/selectitems">
      <i className="bi bi-heart-fill text-xl"></i>
     </Link>

    <Cart cartItems={cartItems}/>

     <button onClick={()=>setShowMenu(!showMenu)} className="text-2xl sm:text-3xl shrink-0 cursor-pointer">
      <i className={showMenu?"bi bi-x":"bi bi-list"}></i>
     </button>
    </div>
   </nav>

   {showMenu&&(
    <div className="lg:hidden bg-white border-t shadow-lg p-5">
     <div className="flex flex-col gap-4">
      <Link to="/" onClick={()=>setShowMenu(false)}>Home</Link>
      <a href="#about" onClick={()=>setShowMenu(false)}>About Us</a>
      <a href="#process" onClick={()=>setShowMenu(false)}>Process</a>
      <a href="#contact" onClick={()=>setShowMenu(false)}>Contact Us</a>



      <Link to="/login" onClick={()=>setShowMenu(false)}>
       <button className="w-full h-10 flex items-center justify-center gap-1 border-2 bg-blue-100 hover:bg-blue-500 hover:text-white rounded-full">
        <IoMdContact className="text-2xl"/>
        Login
       </button>
      </Link>
     </div>
    </div>
   )}
  </header>
 );
};

export default Navbar;
