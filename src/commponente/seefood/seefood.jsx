import CategoryPage from '../categoryPage/categoryPage'
import BgSeaFood  from  '../../assets/all imges/seafood-banner.jpg'

const Seefood = () => {
  return (
    <div>
       <CategoryPage title='Meat & Seafood' bgImage={BgSeaFood} categories={'Seafood'}  />
    </div>
  )
}

export default Seefood

