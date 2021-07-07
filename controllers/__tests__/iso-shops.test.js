'use strict';

const { listIsoShops } = require('../iso-shops');

describe('ISO shops', () => {
  test('listIsoShops', () => {
    const isoShops = [{ code: 'af', name: 'Afrikaans (af)' }];
    const getIsoShops = jest.fn(() => isoShops);
    global.strapi = {
      plugins: {
        multishop: {
          services: {
            'iso-shops': {
              getIsoShops,
            },
          },
        },
      },
    };

    const ctx = {};
    listIsoShops(ctx);

    expect(ctx.body).toMatchObject(isoShops);
  });
});
