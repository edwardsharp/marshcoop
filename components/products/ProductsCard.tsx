import React from 'react'
import useSWR from 'swr'

import { getProducts } from '../../services/products'

export default function ProductsCard() {
  const { data: products, error } = useSWR('get_products', getProducts)

  if (error) return <div>failed to load</div>
  if (!products) return <div>loading...</div>

  return (
    <>
      <h2>Products</h2>
      <p>{products && products.length}</p>
    </>
  )
}
