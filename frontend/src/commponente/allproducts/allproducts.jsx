import BgAll from '../../assets/all imges/all-banner.webp'
import { useLocation } from "react-router-dom";
import CategoryPage from '../categoryPage/categoryPage'
const Allproducts = () => {
  const location = useLocation();
  const searchProduct = location.state?.searchProduct || "";
  return (
    <div>
      <CategoryPage title={searchProduct ? searchProduct : "All Products"} bgImage={BgAll} categories="All" searchProduct={searchProduct} />
    </div>
  )
}

export default Allproducts
