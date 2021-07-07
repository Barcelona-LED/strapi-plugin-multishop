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
  })
  .noUnknown();

const validateUpdateShopInput = data => {
  return updateShopSchema.validate(data, { strict: true, abortEarly: false }).catch(handleReject);
};

module.exports = {
  validateCreateShopInput,
  validateUpdateShopInput,
};
