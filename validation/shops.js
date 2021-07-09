'use strict';

const { prop } = require('lodash/fp');
const { yup, formatYupErrors } = require('strapi-utils');

const handleReject = error => Promise.reject(formatYupErrors(error));

const createShopSchema = yup
  .object()
  .shape({
    name: yup
      .string()
      .max(50)
      .nullable(),
    url: yup
      .string()
      .required(),
    isDefault: yup.boolean().required(),
    default_locale: yup.string()
  })
  .noUnknown();

const validateCreateShopInput = data => {
  return createShopSchema.validate(data, { strict: true, abortEarly: false }).catch(handleReject);
};

const updateShopSchema = yup
  .object()
  .shape({
    name: yup
      .string()
      .min(1)
      .max(50)
      .nullable(),
    isDefault: yup.boolean(),
    url: yup.string(),
    default_locale: yup.string()
  })
  .noUnknown();

const validateUpdateShopInput = data => {
  return updateShopSchema.validate(data, { strict: true, abortEarly: false }).catch(handleReject);
};

module.exports = {
  validateCreateShopInput,
  validateUpdateShopInput,
};
