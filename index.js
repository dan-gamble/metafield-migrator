import dotenv from 'dotenv'
import { GraphQLRequester } from './requester.js'
import * as util from 'node:util'
import { MetafieldObjectInputParser } from './metafield-object-input-parser.js'

dotenv.config()

/*
* TODO:
*  - Rating fields don't come across
*  - Metaobject definitions first as they're needed for metafields
*/

const sourceRequester = new GraphQLRequester(process.env.SOURCE_SHOPIFY_STORE, process.env.SOURCE_SHOPIFY_ADMIN_API_ACCESS_TOKEN)
const targetRequester = new GraphQLRequester(process.env.TARGET_SHOPIFY_STORE, process.env.TARGET_SHOPIFY_ADMIN_API_ACCESS_TOKEN)

// await migrateSimpleMetaobjectDefinitions()

await migrateMetafieldDefinitions()

async function migrateSimpleMetaobjectDefinitions () {
  const definitions = await sourceRequester.getMetaobjectDefinitions()
  const nodes = definitions.data.metaobjectDefinitions.edges
    .map(({ node }) => node)
    // .filter(node => node.fieldDefinitions.some(definition => {
    //   if (definition.validations.length === 0) return true
    //
    //   return definition.validations.some(validation => !validation.name.includes('metaobject_definition_id'))
    // }))

  // console.log(util.inspect(nodes.filter(node => node.fieldDefinitions.some(definition => {
  //   console.log({ definition })
  //
  //   return definition.validations.some(validation => {
  //     console.log({ validation })
  //
  //     return true
  //   })
  // })), false, null, true))

  // for (const node of nodes) {
  //   console.log(`Creating ${node.name} metaobject in target store ${process.env.TARGET_SHOPIFY_STORE}`)
  //
  //   const r = await targetRequester.createMetaobjectDefinition({
  //     ...node,
  //     id: undefined,
  //     fieldDefinitions: node.fieldDefinitions.map((definition) => ({
  //       ...definition,
  //       type: definition.type.name,
  //       validations: definition.validations.map((validation) => ({
  //         ...validation,
  //         type: undefined,
  //       })),
  //     })),
  //   })
  //   if (r?.data?.metaobjectDefinitionCreate?.userErrors?.length > 0) {
  //     console.log(util.inspect({
  //       ...node,
  //       fieldDefinitions: node.fieldDefinitions.map((definition) => ({
  //         ...definition,
  //         type: definition.type.name,
  //         validations: definition.validations.map((validation) => ({
  //           ...validation,
  //           type: undefined,
  //         })),
  //       })),
  //     }, false, null, true))
  //     console.log(r.data.metaobjectDefinitionCreate.userErrors)
  //   }
  // }
}

async function migrateMetafieldDefinitions () {
  const typesToGet = ['ARTICLE', 'BLOG', 'COLLECTION', 'CUSTOMER', 'MARKET', 'ORDER', 'PAGE', 'PRODUCT', 'PRODUCTVARIANT', 'SHOP']

  for (const type of typesToGet) {
    console.log(`Fetching ${type} metafields from source store ${process.env.SOURCE_SHOPIFY_STORE}`)
    const definitions = await sourceRequester.getMetafieldDefinitions(type)
    if (definitions.data.metafieldDefinitions.edges.length === 0) continue

    for (const { node } of definitions.data.metafieldDefinitions.edges) {
      console.log({ node })
      console.log(`Creating ${type} metafield ${node.namespace}:${node.key} in target store ${process.env.TARGET_SHOPIFY_STORE}`)
      const a = await targetRequester.createMetafieldDefinition({
        namespace: node.namespace,
        key: node.key,
        name: node.name,
        description: node.description,
        type: node.type.name,
        ownerType: type,
      })
      console.log(a)
    }
  }
}
