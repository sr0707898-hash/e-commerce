import Button from "../buttion/button"
import Grocery from '../../assets/all imges/grocery.webp'

const Hero = () => {
  return (
  <section>
  <div className='mx-auto flex min-h-screen max-w-[1400px] flex-col items-center px-4 pb-10 pt-32 sm:px-6 lg:flex-row lg:px-10 lg:pt-28' >
       {/* contant sec1 */}
    <div className='w-full flex-1'>
     <span className='mb-5 inline-block rounded-full bg-orange-100 px-4 py-2 text-base text-orange-500 sm:px-5 sm:text-lg'>Export Best Quality...</span>
     <h1 className='text-4xl font-bold sm:text-5xl md:text-7xl/20'>Tasty Organic <br /> <span className='text-orange-500'>Fruits</span>  & <span className='text-orange-500'>Veggies</span> <br /> In Your City</h1>
     <p className='mt-5 mb-5 w-full max-w-[530px] text-base text-zinc-600 sm:text-lg'>Bred for high content benefical substances. Our products are all fresh and healthy.</p>
       <Button content="Shop Now" />
      </div>
       
       {/* sec1 images */}

      <div className='w-full flex-1'>
      <img
        src={Grocery}
        alt="Fresh grocery assortment"
        width="1920"
        height="1639"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="mx-auto h-auto w-full max-w-xl object-contain"
      />
      </div>

    </div>
   </section>
  )
}

export default Hero
