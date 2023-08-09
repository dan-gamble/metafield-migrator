import gql from 'graphql-tag'

export class GraphQLRequester {
  constructor (store, accessToken) {
    this.store = store
    this.accessToken = accessToken
  }

  async request (query, variables = {}) {
    const response = await fetch(`https://${this.store}.myshopify.com/admin/api/2023-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ query: query.loc.source.body, variables }),
    })

    if (!response.ok) {
      throw response
    }

    return response.json()
  }

  /**
   * @param {MetafieldOwnerType} ownerType
   *
   * @returns Promise<{data: { metafieldDefinitions: MetafieldDefinitionConnectionResolvers }}>
   */
  async getMetafieldDefinitions (ownerType) {
    const query = gql`
      query {
        metafieldDefinitions(first: 250, ownerType: ${ownerType}) {
          edges {
            node {
              name
              key
              namespace
              description
              pinnedPosition
              type { name }
              useAsCollectionCondition
            }
          }
        }
      }
    `

    return this.request(query)
  }

  /**
   * @returns Promise<{data: { metaobjectDefinitions: MetaobjectDefinitionConnectionResolvers }}>
   */
  async getMetaobjectDefinitions () {
    const query = gql`
      query {
        metaobjectDefinitions(first: 50) {
          edges {
            node {
              id
              name
              capabilities {
                publishable {
                  enabled
                }
                translatable {
                  enabled
                }
              }
              displayNameKey
              description
              type
              fieldDefinitions {
                name
                key
                type {
                  name
                  category
                  supportedValidations {
                    name
                    type
                  }
                }
                validations {
                  name
                  type
                  value
                }
              }
            }
          }
        }
      }
    `

    return this.request(query)
  }

  /**
   * @param {MetafieldDefinitionInput} input
   */
  async createMetafieldDefinition (input) {
    const mutation = gql`mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          name
        }
        userErrors {
          field
          message
          code
        }
      }
    }`

    return this.request(mutation, { definition: input })
  }

  /**
   * @param {MetaobjectDefinitionCreateInput} input
   */
  async createMetaobjectDefinition (input) {
    const mutation = gql`mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition {
          name
          type
          fieldDefinitions {
            name
            key
          }
        }
        userErrors {
          field
          message
          code
        }
      }
    }`

    return this.request(mutation, { definition: input })
  }
}
