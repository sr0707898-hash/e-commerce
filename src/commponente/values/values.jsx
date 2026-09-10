import Heading from '../heading/heading'
import Basket from '../../assets/all imges/basket-full-vegetables.png'
import { FaHeart, FaLeaf, FaSeedling, FaShieldAlt } from "react-icons/fa";

    


const Values = () => {
    const leftValues = value.slice(0,2).map(item=>{
        return(
        <div key={item.id} className='flex md:flex-row-reverse items-center gap-7'>

            <div>
                <span className=' flex bg-orange-500 justify-center items-center text-3xl text-white w-15 h-15 rounded-full'>{item.icon}</span>
            </div>

            <div className='md:text-right'>
                <h4 className='text-zinc-800 text-3xl font-bold'>{item.title}</h4>
                <p className='text-zine-600 mt-2 '> {item.para}</p>
            </div>


        </div>

    )

    })

    const rightValues = value.slice(2).map(item=>{
        return(
        <div key={item.id} className='flex  items-center gap-7 '>

            <div>
                <span className=' flex bg-orange-500 justify-center items-center text-3xl text-white w-15 h-15 rounded-full'>{item.icon}</span>
            </div>

            <div className=''>
                <h4 className='text-zinc-800 text-3xl font-bold'>{item.title}</h4>
                <p className='text-zine-600 mt-2 '> {item.para}</p>
            </div>


        </div>

    )

    })

  return (
    <section>
        <div className='max-w-[1400px] mx-auto px-10 py-20'>
            <Heading highlight="Our" heading="Value" /> 
            <div className='flex md:flex-row flex-col gap-15 mt-10 md:gap-5 mt-15'> 
                <div className='md:min-h-100 flex gap-15 flex-col justify-between'>
                    {leftValues}
                </div>
                <div className='md:flex w-1/3 hidden '>
                    <img src={Basket} alt="" />
                </div>

                <div className='md:min-h-100 gap-15 flex flex-col justify-between ' >
                    {rightValues}
                </div>

            </div>

        </div>
    </section>
  )
}

export default Values


const value = [
    {
        id:1,
        title: 'Trust',
        para: 'It is long established fast that a reader will be distracted by the readble .',
        icon: <FaHeart />
    },
    {
        id:2,
        title: 'Always Freash',
        para: 'It is long established fast that a reader will be distracted by the readble .',
        icon: <FaLeaf />
    },
    {
        id:3,
        title: 'Food Safety',
        para: 'It is long established fast that a reader will be distracted by the readble .',
        icon: <FaShieldAlt />
    },
    {
        id:4,
        title: '100% Organic',
        para: 'It is long established fast that a reader will be distracted by the readble .',
        icon: <FaSeedling />
    }
]
