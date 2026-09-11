import Banner from '../banner/banner'
import useProducts from '../productList/useProducts'
import Cards from '../card/cards'

const CategoryPage = ({title,bgImage,categories=[], searchProduct=''}) => {
  const products = useProducts()
  let filteredItems = categories.includes('All') ? products : products.filter(item=> categories.includes(item.category))
  if (searchProduct) filteredItems = filteredItems.filter(item => item.name.toLowerCase().includes(searchProduct.toLowerCase()))
    const renderproduct = filteredItems.map(product=>{
        return(
      <Cards key={product.id} id={product.id} image={product.image} name={product.name} price={product.price} />
        )
    })

  return (
    <div>
      <Banner title={title} bgImage={bgImage} />

      <div className='grid grid-cols-1 md:grid-cols-4 gap-9 py-20 max-w-350 mx-auto px-10'>
        {renderproduct} 
      </div>
    </div>
  )
}

export default CategoryPage
