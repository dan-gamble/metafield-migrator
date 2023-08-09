export class MetafieldObjectInputParser {
  /**
   * @param {MetaobjectDefinition[]} metaobjectDefinitions
   */
  constructor (metaobjectDefinitions) {
    this.metaobjectDefinitions = metaobjectDefinitions
  }

  /**
   * @returns {MetaobjectDefinitionCreateInput[]}
   */
  asInputs () {
    return this.metaobjectDefinitions.map((definition) => ({
      ...definition,
      fieldDefinitions: definition.fieldDefinitions.map((definition) => ({
        ...definition,
        type: definition.type.name,
        validations: definition.validations.map((validation) => ({
          ...validation,
          type: undefined,
        })),
      })),
    }))
  }

  /**
   * @param {MetafieldDefinitionValidation} validation
   */
  validation (validation) {
    if (validation.name === 'metaobject_definition_id') {
      return {
        ...validation,
        type: undefined,
        value: undefined
      }
    }

    return {
      ...validation,
      type: undefined
    }
  }
}
