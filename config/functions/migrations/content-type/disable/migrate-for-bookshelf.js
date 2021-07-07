'use strict';

const pmap = require('p-map');

const BATCH_SIZE = 1000;

const migrateForBookshelf = async (
  { ORM, defaultShop definition, previousDefinition, model },
  context
) => {
  const storesTable = `${previousDefinition.collectionName}__stores`;
  const trx = await ORM.knex.transaction();
  try {
    let offset = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let batch = await trx
        .select(['id'])
        .from(model.collectionName)
        .whereNot('shop', defaultShop)
        .orderBy('id')
        .offset(offset)
        .limit(BATCH_SIZE);
      offset += BATCH_SIZE;

      await pmap(batch, entry => model.deleteRelations(entry.id, { transacting: trx }), {
        concurrency: 100,
        stopOnError: true,
      });

      if (batch.length < BATCH_SIZE) {
        break;
      }
    }
    await trx
      .from(model.collectionName)
      .del()
      .whereNot('shop', defaultShop);
    await trx.commit();
  } catch (e) {
    await trx.rollback();
    throw e;
  }

  if (definition.client === 'sqlite3') {
    // Bug when dropping column with sqlite3 https://github.com/knex/knex/issues/631
    // Need to recreate the table
    context.recreateSqliteTable = true;
  } else {
    await ORM.knex.schema.table(definition.collectionName, t => {
      t.dropColumn('shop');
    });
  }

  await ORM.knex.schema.dropTableIfExists(storesTable);
};

module.exports = migrateForBookshelf;
