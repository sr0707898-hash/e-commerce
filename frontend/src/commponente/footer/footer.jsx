import { IoIosArrowForward } from "react-icons/io";
const Footer = () => {
  return (
    <footer className='bg-zinc-100 py-20 mt-20'>
        <div className=' flex flex-wrap max-w-[1400px] mx-auto px-10 gap-y-12'>
             <div className=' flex-1 basis-[300px]'>
                <a href="#"className='text-4xl font-bold   '>
                {/* <img src={logo} alt="" className='' /> */}
                Gr<span className='text-orange-500 uppercase'>O</span>cify
                      </a>

                    <p className='text-zinc-600 mt-6 max-w-[350px]'>
                        Bred for a high content of baneficial substances. Qur products are a Lorem ipsum dolor sit amet. 
                    </p>

                    <p className='text-zinc-800 mt-6'> 2025 &copy; All Rights Reserved</p>
                 
              </div>

              <ul className='flex-1'>
                <li className=''>
                    <h5 className='text-zinc-800 text-2xl font-bold '> Company</h5>
                </li>
                <li className='mt-6'>
                    <a href="#" className='text-zinc-800 hover:text-orange-500'>Acout</a>
                </li>
                <li className='mt-6'>
                    <a href="$" className='text-zinc-800 hover:text-orange-500'>FAQ</a>
                </li>
               </ul>

              <ul className='flex-1'>
                <li className=''>
                    <h5 className='text-zinc-800 text-2xl font-bold '> Support</h5>
                </li>
                <li className='mt-6'>
                    <a href="#" className='text-zinc-800 hover:text-orange-500'>Support Center</a>
                </li>
                <li className='mt-6'>
                    <a href="$" className='text-zinc-800 hover:text-orange-500'>Feedback</a>
                </li>
                 <li className='mt-6'>
                    <a href="$" className='text-zinc-800 hover:text-orange-500'>Contact Us</a>
                </li>
              </ul>
              <div className='flex-1'>
                <h5 className='text-zinc-800 text-2xl font-bold'>Stay onnected</h5>

                <p className='mt-6 text-inc-600'>Questions or Feeback? <br />
                We'd love to hear from you</p>

                <div className=' flex bg-white p-1 rounded-lg mt-6'>
                    <input type='email' name='email' id='email' autoComplete='off' placeholder='Email Address  ' className='h-[5vh] pl-4 flex-1 focus:ouline-none'></input>
                    <button className='bg-orange-500 p-2 rounded-lg text-axl text-white hover:to-orange-600 cursor-pointer '>
                        <IoIosArrowForward />
                    </button>
                </div>
              </div>
        </div>
    </footer>
   
  )
}

export default Footer
