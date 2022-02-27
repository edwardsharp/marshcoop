import { SupabaseClient } from '@supabase/supabase-js'
import { definitions } from '../../types/supabase'
import { logEvent } from './events'
import { supabase } from './supabase'

export type Product = definitions['products']

export async function getProducts(limit = 1000) {
  const {
    data: products,
    error,
    count,
  } = await supabase
    .from<Product>('products')
    .select('*', { count: 'exact' })
    .limit(limit)

  if (error) throw new Error(error.message)
  return products
}

export async function getProductsCount() {
  const { error, count } = await supabase
    .from<Product>('products')
    .select('*', { count: 'exact' })

  if (error) throw new Error(error.message)
  return count
}

export async function getCategories(): Promise<{ [index: string]: string }> {
  const { data, error } = await supabase.rpc('distinct_product_categories')

  if (error) {
    throw new Error(error.message)
  }

  // #TODO: rework this to just reduce to a string array of .category items
  return data?.reduce((acc, row) => {
    acc[row.category] = row.category
    return acc
  }, {})
}

export async function getSubCategories(category: string) {
  const { data, error } = await supabase.rpc(
    'distinct_product_sub_categories',
    { category }
  )

  if (error) {
    throw new Error(error.message)
  }

  // #TODO: rework this to just reduce to a string array of .category items
  return data?.reduce((acc, row) => {
    acc[row.category] = row.category
    return acc
  }, {})
}

// all the functions below are known to need non-anon privileges, so client prop is passed in.
// there might be a better way; this is sort of ad-hoc DI :internet-shrugz:
export async function upsertProducts(props: {
  products: Product | Product[]
  client?: SupabaseClient
}) {
  const { client, products } = props
  const c = client ? client : supabase

  const { data, error, count } = await c.from('products').upsert(products)

  //   if (error) throw new Error(error.message)
  if (error) {
    logEvent({
      tag: 'upsertProducts',
      message: `upsertProducts caught error: ${error.message})`,
      level: 'error',
    })
  }
  logEvent({
    tag: 'upsertProducts',
    message: `upsertProducts result count: ${count})`,
    level: 'debug',
    data: JSON.stringify({ data, error, count }),
  })
  return data
}

export async function updateProductCountOnHand(props: {
  variation_id: string
  count_on_hand: number
  client?: SupabaseClient
}) {
  const { variation_id, count_on_hand, client } = props
  const c = client ? client : supabase
  const { data, error } = await c
    .from<Product>('products')
    .update({ count_on_hand })
    .match({ variation_id })

  //   if (error) throw new Error(error.message)
  if (error) {
    logEvent({
      tag: 'updateProductCountOnHand',
      message: `updateProductCountOnHand caught error: ${error.message})`,
      level: 'error',
    })
  }
  return data
}
