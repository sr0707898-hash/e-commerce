import CategoryPage from '../categoryPage/categoryPage'
import BgDairy from '../../assets/all imges/dairy-banner.webp'

const Dairy = () => {
  return (
    <div>
      <CategoryPage title='Dairy & Eggs' bgImage={BgDairy} categories={'Dairy'} />
    </div>
    
  )
}

export default Dairy
