import Button from "../buttion/button"
import Grocery from '../../assets/all imges/grocery.png'

const Hero = () => {
  return (
   <section>
    <div className='min-h-screen max-w-[1400px] mx-auto md:px-10 px-10 flex md:flex-row flex-col items-center pt-28 ' >
       {/* contant sec1 */}
      <div className='flex-1'>
       <span className='bg-orange-100 text-orange-500 px-5 py-2 my-10 rounded-full text-lg mb-5'>Export Best Quality...</span>
       <h1 className=' md:text-7xl/20 text-[50px] font-bold'>Tasty Organic <br /> <span className='text-orange-500'>Fruits</span>  & <span className='text-orange-500'>Veggies</span> <br /> In Your City</h1>
       <p className='text-zine-600 text-lg  md:max-w-[530px] w-[400px] mt-5 mb-5'>Bred for high content benefical substances. Our products are all fresh and healthy.</p>
       <Button content="Shop Now" />
      </div>
       
       {/* sec1 images */}

      <div className='flex-1 '>
      <img src={Grocery} alt="" />
      </div>

    </div>
   </section>
  )
}

export default Hero
