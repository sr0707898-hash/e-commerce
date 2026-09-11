
import Category from '../category/category';

import Hero from "../hero/Hero"
import Values from '../values/values';
import Product from '../products/product';
import Discount from '../discount/discount';
import Process from '../process/process';
import Testimonials from '../testimonials/testimonials';



const Home = () => {
  return (
    <div>
    
    <Hero />
    <Category />
    <Values />
    <Product />
    <Discount />
    <Process />
    <Testimonials />
    
    </div>
  )
}

export default Home
