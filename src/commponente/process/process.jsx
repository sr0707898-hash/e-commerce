import Heading from '../heading/heading'
import { TbCircleNumber1Filled, TbCircleNumber2Filled, TbCircleNumber3Filled, TbCircleNumber4Filled } from "react-icons/tb";

import { PiPlant, PiFactory } from "react-icons/pi";
import { SlBadge } from "react-icons/sl";
import { BsTruck } from "react-icons/bs";

const Process = () => {
  const rendersteps = staps.map(item=>{
    return(
        <div key={item.id} className={`flex-1 basis-[300px] ${item.id % 2 === 0 ?'md:-mt-100': ''}`}>
            <span className='flex justify-center mx-auto h-18 w-18 rounded-full text-white bg-zinc-800 outline-[2px] items-center text-8xl outline-offset-7 outline-zinc-800 outline-dashed'>{item.number} </span>

            <div className='flex items-center mt-10 gap-x-5'> 
                
                    <span className='flex bg-orange-500 text-white w-15 h-15 rounded-full text-3xl items-center justify-center'>{item.icon}</span>
                
                <div className='flex-1'>
                    <h3 className='text-zinc-800 text-2xl font-bold'>{item.title}</h3>
                    <p className='text-zinc-600 mt-2'>{item.para}</p>
                </div>
            </div>
        </div>
    )
  })
  return (
    <section>
        <div className='max-w-[1400] mx-auto px-10 py-20'>
            <div className='f-fit mr-auto'>
                <Heading  highlight="Our" heading="Process" />

            </div>
            <div className='flex flex-wrap gap-y-17 md:mt-20 mt-10 justify-center items-center md:pt-50'>
                {rendersteps}
            </div>
        </div>
    </section>
  )
}

export default Process




const staps =[
    {
        id:1,
        number:<TbCircleNumber1Filled />,
        title: 'Sourcing',
        para: 'it is a long estableished fast that a reader',
        icon:<PiPlant />
    },
    {
        id:2,
        number:<TbCircleNumber2Filled />,
        title: 'ManuFacturing',
        para: 'it is a long estableished fast that a reader',
        icon:<PiFactory />
    },
    {
        id:3,
        number:<TbCircleNumber3Filled />,
        title: 'Quality Control',
        para: 'it is a long estableished fast that a reader',
        icon:<SlBadge />
    },
    {
        id:4,
        number:<TbCircleNumber4Filled />,
        title: 'Logistice',
        para: 'it is a long estableished fast that a reader',
        icon:<BsTruck />
    },
]
