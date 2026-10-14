import Heading from '../heading/heading'
import { TbCircleNumber1Filled, TbCircleNumber2Filled, TbCircleNumber3Filled, TbCircleNumber4Filled } from "react-icons/tb";

import { PiPlant, PiFactory } from "react-icons/pi";
import { SlBadge } from "react-icons/sl";
import { BsTruck } from "react-icons/bs";

const Process = () => {
    const rendersteps = staps.map((item) => (
        <article key={item.id} className="min-w-0">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-zinc-800 text-5xl text-white outline outline-2 outline-dashed outline-offset-4 outline-zinc-800">
                {item.number}
            </span>

            <div className="mt-8 flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-500 text-2xl text-white">
                    {item.icon}
                </span>

                <div className="min-w-0">
                    <h3 className="text-xl font-bold text-zinc-800">{item.title}</h3>
                    <p className="mt-2 text-zinc-600">{item.para}</p>
                </div>
            </div>
        </article>
    ))

  return (
        <section id="process" className="py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <Heading highlight="Our" heading="Process" />
                <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
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
