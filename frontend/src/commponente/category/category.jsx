
import Heading from '../heading/heading'

import FruitsCat from '../../assets/all imges/fruits-and-veggies.png'

import SeaFoodcat from '../../assets/all imges/meat-and-seafood.png'
import DairyCat from '../../assets/all imges/dairy-and-eggs.png'

import { Link } from 'react-router-dom'

const category = [
    {
        id: 1,
        title: 'Fruite & Veggies',
        description:
            'Fresh, organic produce sourced daily from local farms. Explore a wide range of seasonal fruits and crisp vegetables.',
        image: FruitsCat,
        path: '/fruits'
    },
    {
        id: 2,
        title: 'Dairy & Eggs',
        description:
            'Wholesome dairy products and free-range eggs. From creamy milk and yogurt to artisanal cheeses.',
        image: DairyCat,
        path: '/dairy'
    },
    {
        id: 3,
        title: 'Meat & SeaFood',
        description:
            'High-quality, responsibly sourced meat and seafood. Choose from fresh cuts, marinated options, and more.',
        image: SeaFoodcat,
        path: '/seefood'
    }
]

const Category = () => {

    const rendercards = category.map(card => {
        return (
            <div
                className='  w-fullsm:w-[48%] lg:flex-1 basis-[300px] 'key={card.id}>

                <div className='w-full h-[250px] sm:h-[280px] md:h-[300px] relative -mb-10'>
                    <img
                        src={card.image}
                        className='absolute bottom-0 left-1/2 -translate-x-1/2 max-w-[90%] h-auto'
                        alt={card.title}
                    />
                </div>

                <div className='bg-zinc-100 pt-17 p-5 sm:p-6 md:p-8 rounded-xl'>

                    <h3 className='text-zinc-800 text-2xl sm:text-3xl font-bold'>
                        {card.title}
                    </h3>

                    <p className='text-zinc-600 mt-3 mb-7 sm:mb-9 text-sm sm:text-base'>
                        {card.description}
                    </p>

                    <Link to={card.path} className='bg-red-500 text-white px-8 py-3 rounded-lg hover:scale-105 hover:bg-red-600 cursor-pointer'>See All</Link>

                </div>
            </div>
        )
    })

    return (
        <section>
            <div className='max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 md:py-20'>

                <Heading
                    highlight='Shop'
                    heading='by Category'
                />

                <div className=' flex flex-col md:flex-row flex-wrap gap-8 sm:gap-1  lg:gap-16 xl:gap-20 mt-8 md:mt-12 '>
                    {rendercards}
                </div>

            </div>
        </section>
    )
}

export default Category