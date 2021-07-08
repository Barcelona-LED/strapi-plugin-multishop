import { has, get, omit } from 'lodash';
import MULTISHOP_FIELDS from './shopEnabledFields';

const shopEnabledPath = ['pluginOptions', 'multishop', 'shopEnabled'];

const addMultishopToFields = attributes =>
  Object.keys(attributes).reduce((acc, current) => {
    const currentAttribute = attributes[current];

    if (MULTISHOP_FIELDS.includes(currentAttribute.type)) {
      const multishop = { shopEnabled: true };

      const pluginOptions = currentAttribute.pluginOptions
        ? { ...currentAttribute.pluginOptions, multishop }
        : { multishop };

      acc[current] = { ...currentAttribute, pluginOptions };

      return acc;
    }

    acc[current] = currentAttribute;

    return acc;
  }, {});

const disableAttributesMultishop = attributes =>
  Object.keys(attributes).reduce((acc, current) => {
    acc[current] = omit(attributes[current], 'pluginOptions.multishop');

    return acc;
  }, {});

const mutateCTBContentTypeSchema = (nextSchema, prevSchema) => {
  // Don't perform mutations components
  if (!has(nextSchema, shopEnabledPath)) {
    return nextSchema;
  }

  const isNextSchemaShopEnabled = get(nextSchema, shopEnabledPath, false);
  const isPrevSchemaShopEnabled = get(prevSchema, ['schema', ...shopEnabledPath], false);

  // No need to perform modification on the schema, if the multishop feature was not changed
  // at the ct level
  if (isNextSchemaShopEnabled && isPrevSchemaShopEnabled) {
    return nextSchema;
  }

  if (isNextSchemaShopEnabled) {
    const attributes = addMultishopToFields(nextSchema.attributes);

    return { ...nextSchema, attributes };
  }

  // Remove the multishop object from the pluginOptions
  if (!isNextSchemaShopEnabled) {
    const pluginOptions = omit(nextSchema.pluginOptions, 'multishop');
    const attributes = disableAttributesMultishop(nextSchema.attributes);

    return { ...nextSchema, pluginOptions, attributes };
  }

  return nextSchema;
};
export default mutateCTBContentTypeSchema;
export { addMultishopToFields, disableAttributesMultishop };
