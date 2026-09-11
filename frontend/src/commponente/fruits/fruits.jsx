import CategoryPage from '../categoryPage/categoryPage'
import BgFruits from '../../assets/all imges/fruits-banner.jpg'
const Fruits = () => {
  return (
    <div>
      <CategoryPage title='Fruits & Vegitables' bgImage={BgFruits} categories={['Fruits','Vegetables']} />
    </div>
  )
}

export default Fruits
