import CategoryPage from '../categoryPage/categoryPage'
import BgDairy from '../../assets/all imges/dairy-banner.jpg'

const Dairy = () => {
  return (
    <div>
      <CategoryPage title='Dairy & Eggs' bgImage={BgDairy} categories={'Dairy'} />
    </div>
    
  )
}

export default Dairy
