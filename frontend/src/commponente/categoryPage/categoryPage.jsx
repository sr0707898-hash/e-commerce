import Banner from '../banner/banner'
import { useEffect, useState } from 'react'
import useProducts from '../productList/useProducts'
import Cards from '../card/cards'

const PAGE_SIZE = 8

const CategoryPage = ({ title, bgImage, categories = [], searchProduct = '' }) => {
  const products = useProducts()
  const pageKey = JSON.stringify([title, categories, searchProduct])
  const [pagination, setPagination] = useState({ key: '', page: 1 })
  let filteredItems = categories.includes('All')
    ? products
    : products.filter((item) => categories.includes(item.category))

  if (searchProduct) {
    filteredItems = filteredItems.filter((item) =>
      item.name.toLowerCase().includes(searchProduct.toLowerCase())
    )
  }

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE)
  const currentPage = pagination.key === pageKey ? pagination.page : 1
  const displayedPage = Math.min(currentPage, totalPages || 1)
  const pageItems = filteredItems.slice((displayedPage - 1) * PAGE_SIZE, displayedPage * PAGE_SIZE)

  useEffect(() => {
    const description = document.querySelector('meta[name="description"]')
    const defaultDescription = 'Shop fresh fruits, vegetables, dairy, seafood, and daily groceries online with quality products from Grocify.'
    const pageDescription = searchProduct
      ? `Shop ${searchProduct} and discover fresh groceries at Grocify.`
      : `Shop ${title.toLowerCase()} online at Grocify. Browse quality products and fresh groceries.`

    document.title = `${searchProduct || title} | Grocify`
    if (description) description.content = pageDescription

    return () => {
      document.title = 'Grocify | Fresh Groceries, Fruits & Vegetables'
      if (description) description.content = defaultDescription
    }
  }, [searchProduct, title])

  return (
    <div>
      <Banner title={title} bgImage={bgImage} />

      <div className='grid grid-cols-1 md:grid-cols-4 gap-9 py-20 max-w-350 mx-auto px-10'>
        {pageItems.map((product) => (
          <Cards key={product.id} id={product.id} image={product.image} name={product.name} price={product.price} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-2 pb-16" aria-label="Product pagination">
          <button
            type="button"
            onClick={() => setPagination({ key: pageKey, page: Math.max(1, displayedPage - 1) })}
            disabled={displayedPage === 1}
            className="rounded border border-zinc-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setPagination({ key: pageKey, page })}
              aria-current={displayedPage === page ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
              className={`size-10 rounded border px-3 py-2 ${displayedPage === page ? 'border-orange-700 bg-orange-700 text-white' : 'border-zinc-300 hover:border-orange-700'}`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPagination({ key: pageKey, page: Math.min(totalPages, displayedPage + 1) })}
            disabled={displayedPage === totalPages}
            className="rounded border border-zinc-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  )
}

export default CategoryPage
