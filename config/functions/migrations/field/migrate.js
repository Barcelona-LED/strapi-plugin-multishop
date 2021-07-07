'use strict';

const { pick, prop } = require('lodash/fp');
const { getService } = require('../../../../utils');
const { shouldBeProcessed, getUpdatesInfo, getSortedShops } = require('./utils');

const BATCH_SIZE = 1000;

const migrateBatch = async (entries, { model, attributesToMigrate }, { transacting }) => {
  const { copyNonShopEnabledAttributes } = getService('content-types');

  const updatePromises = entries.map(entity => {
    const updateValues = pick(attributesToMigrate, copyNonShopEnabledAttributes(model, entity));
    const entriesIdsToUpdate = entity.stores.map(prop('id'));
    return Promise.all(
      entriesIdsToUpdate.map(id =>
        strapi.query(model.uid).update({ id }, updateValues, { transacting })
      )
    );
  });

  await Promise.all(updatePromises);
};

const migrate = async ({ model, attributesToMigrate }, { migrateFn, transacting } = {}) => {
  const shops = await getSortedShops({ transacting });
  const processedShopCodes = [];
  for (const shop of shops) {
    let offset = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const entries = await strapi
        .query(model.uid)
        .find({ shop, _start: offset, _limit: BATCH_SIZE }, null, { transacting });
      const entriesToProcess = entries.filter(shouldBeProcessed(processedShopCodes));

      if (migrateFn) {
        const updatesInfo = getUpdatesInfo({ entriesToProcess, attributesToMigrate });
        await migrateFn({ updatesInfo, model }, { transacting });
      } else {
        await migrateBatch(entriesToProcess, { model, attributesToMigrate }, { transacting });
      }

      if (entries.length < BATCH_SIZE) {
        break;
      }
      offset += BATCH_SIZE;
    }
    processedShopCodes.push(shop);
  }
};

module.exports = {
  migrate,
};
