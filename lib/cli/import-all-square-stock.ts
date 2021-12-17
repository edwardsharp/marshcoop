#!/usr/bin/env ts-node

import dotenv from 'dotenv'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}

import { getProductsInStock, mapProductsToStock } from '../../services/square'
import fs from 'fs'
import superjson from 'superjson'

const main = async () => {
  console.log('gonna fetch stock from square, this might take a while...')
  const products = await getProductsInStock()
  const stock = mapProductsToStock(products)

  console.log('square getProductsInStock() length:', products.length)

  if (products.length) {
    console.log('square getProductsInStock() length:', products.length)
    fs.writeFileSync('products.json', superjson.stringify(products))

    fs.writeFileSync('stock.json', superjson.stringify(stock))
    console.log('wrote file: products.json, stock.json.')
  } else {
    console.warn('no stock!')
  }

  console.log('done!')
}

main()
