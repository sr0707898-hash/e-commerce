import { IoIosArrowForward } from "react-icons/io";
import { getProjectSettings } from "../dashboard/projectSettings";

const Footer = () => {
    const projectSettings = getProjectSettings();

  return (
    <footer className='bg-zinc-100 py-20 mt-20'>
           <div className=' flex flex-wrap max-w-350 mx-auto px-10 gap-y-12'>
             <div className=' flex-1 basis-75'>
                <a href="#"className='text-4xl font-bold   '>
                                {projectSettings.storeName}
                      </a>

                    <p className='text-zinc-600 mt-6 max-w-87.5'>
                                                {projectSettings.about}
                    </p>

                                        <p className='text-zinc-800 mt-6'> {projectSettings.email}</p>
                                        <p className='text-zinc-800 mt-2'> {projectSettings.phone}</p>
                                        <p className='text-zinc-800 mt-2'> {projectSettings.address}</p>
                                        <p className='text-zinc-800 mt-6'> 2025 &copy; All Rights Reserved</p>
                 
              </div>

              <ul className='flex-1'>
                <li className=''>
                    <h5 className='text-zinc-800 text-2xl font-bold '> Company</h5>
                </li>
                <li className='mt-6'>
                    <a href="#" className='text-zinc-800 hover:text-orange-700'>Acout</a>
                </li>
                <li className='mt-6'>
                    <a href="$" className='text-zinc-800 hover:text-orange-700'>FAQ</a>
                </li>
               </ul>

              <ul className='flex-1'>
                <li className=''>
                    <h5 className='text-zinc-800 text-2xl font-bold '> Support</h5>
                </li>
                <li className='mt-6'>
                    <a href="#" className='text-zinc-800 hover:text-orange-700'>Support Center</a>
                </li>
                <li className='mt-6'>
                    <a href="$" className='text-zinc-800 hover:text-orange-700'>Feedback</a>
                </li>
                 <li className='mt-6'>
                    <a href="$" className='text-zinc-800 hover:text-orange-700'>Contact Us</a>
                </li>
              </ul>
              <div className='flex-1'>
                <h5 className='text-zinc-800 text-2xl font-bold'>Stay onnected</h5>

                <p className='mt-6 text-inc-600'>Questions or Feeback? <br />
                We'd love to hear from you</p>

                <div className=' flex bg-white p-1 rounded-lg mt-6'>
                    <label htmlFor='newsletter-email' className='sr-only'>Email address</label>
                    <input type='email' name='email' id='newsletter-email' autoComplete='email' placeholder='Email Address' className='h-[5vh] pl-4 flex-1 focus:ouline-none'></input>
                    <button type='button' aria-label='Subscribe to newsletter' className='bg-orange-700 p-2 rounded-lg text-axl text-white hover:bg-orange-800 cursor-pointer '>
                        <IoIosArrowForward />
                    </button>
                </div>
              </div>
        </div>
    </footer>
   
  )
}

export default Footer
