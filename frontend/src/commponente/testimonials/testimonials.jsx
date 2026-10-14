import { Swiper, SwiperSlide } from 'swiper/react';
import Heading from '../heading/heading'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import { Navigation } from 'swiper/modules';
import Custmer1 from '../../assets/all imges/customer1.webp'
import Custmer2 from '../../assets/all imges/customer2.webp'
import Custmer3 from '../../assets/all imges/customer3.webp'
import Custmer4 from '../../assets/all imges/customer4.webp'
import Custmer5 from '../../assets/all imges/customer5.webp'
import 'swiper/css';
import 'swiper/css/navigation';
import { FaStar } from "react-icons/fa6";

const Testimonials = () => {


  return (
    <section>
     <div className='max-w-[1400] mx-auto px-10' >
        <Heading highlight='Customers' heading='Saying' />

        <div className='flex justify-end py-5 gap-x-3'>
            <button aria-label="Previous customer reviews" className=' custom-prev text-2xl text-zinc-800 rounded-lg w-11 h-11 flex justify-center items-center bg-zinc-100 hover:bg-orange-700 hover:text-white cursor-pointer' >
                <IoIosArrowBack />
            </button>
            <button aria-label="Next customer reviews" className='custom-next text-2xl text-zinc-800 rounded-lg w-11 h-11 flex justify-center items-center bg-zinc-100 hover:bg-orange-700 hover:text-white cursor-pointer'>
                <IoIosArrowForward />
            </button>
        </div>
        <Swiper navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev"
           }} loop={true} 
           breakpoints={{640:{slidesPerView:1, spaceBetween: 20},  
                          7680:{slidesPerView:2, spaceBetween: 20},
                          1024:{slidesPerView:3, spaceBetween: 20},
                        //   640:{slidesPerView:4},
                        //   640:{slidesPerView:5}

           
           }} modules={[Navigation]} className="mySwiper">
            {
                review.map(item => {
                    return (
                        <SwiperSlide key={item.id} className='bg-zinc-100 rounded-xl p-8'>
                          <div className='flex gap-6 items-center'>
                            <div className='w-16 h-16 rounded-full  outline-2 outline-orange-500 outline-offset-4 overflow-hidden'>
                                <img src={item.image} alt={item.name} width="64" height="64" loading="lazy" decoding="async" className='h-full w-full object-cover' />
 
                            </div>
                            <div>
                               <h5 className='text-xl font-bold'>{item.name}</h5>
                               <p className='text-zinc-600'>{item.Profession}</p>
                               <span className='flex text-yellow-400 mt-3 text-xl gap-1'>
                                {Array.from({length: item.rating },(_,index)=>(
                                    <FaStar key={`${item.id}-star-${index}`} />
                                ))}
                               </span>
                            </div>
                          </div>

                         
                         <div className='mt-10 min-h-[15vh]'>
                            <p className='text-zinc-600'>{item.para}</p>

                         </div>

                        </SwiperSlide>

                    )
                })
            }
        </Swiper>
       
     </div>
    </section>
  )
}

export default Testimonials


const review =[
    {
        id: 1,
        name: 'Doraemon',
        Profession: 'food Blogger',
        rating: 3,
        para: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nam deleniti in dolore sint tenetur velit recusandae expedita, possimus fuga blanditiis.',
        image: Custmer1,
    },
    {
        id: 2,
        name: 'Priyanshu',
        Profession: 'Chef',
        rating: 4,
        para: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nam deleniti in dolore sint tenetur velit recusandae expedita, possimus fuga blanditiis.',
        image: Custmer2,
    
    },
    {
        id: 3,
        name: 'Happy',
        Profession: 'Model',
        rating: 5,
        para: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nam deleniti in dolore sint tenetur velit recusandae expedita, possimus fuga blanditiis.',
        image: Custmer3,
    
    },
    {
        id: 4,
        name: 'Mohan',
        Profession: 'Fitness Coach',
        rating: 4,
        para: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nam deleniti in dolore sint tenetur velit recusandae expedita, possimus fuga blanditiis.',
        image: Custmer4,
    
    },
    {
        id: 5,
        name: 'Sonah',
        Profession: 'Nutritionist',
        rating: 3,
        para: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nam deleniti in dolore sint tenetur velit recusandae expedita, possimus fuga blanditiis.',
        image: Custmer5,
    
    }
    
]