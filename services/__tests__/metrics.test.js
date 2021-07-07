'use strict';

const { sendDidUpdateMultishopShopsEvent, sendDidInitializeEvent } = require('../metrics');
const { isShopEnabledContentType } = require('../content-types');

describe('Metrics', () => {
  test('sendDidInitializeEvent', async () => {
    global.strapi = {
      contentTypes: {
        withMultishop: {
          pluginOptions: {
            multishop: {
              shopEnabled: true,
            },
          },
        },
        withoutMultishop: {
          pluginOptions: {
            multishop: {
              shopEnabled: false,
            },
          },
        },
        withNoOption: {
          pluginOptions: {},
        },
      },
      plugins: {
        multishop: {
          services: {
            ['content-types']: {
              isShopEnabledContentType,
            },
          },
        },
      },
      telemetry: {
        send: jest.fn(),
      },
    };

    await sendDidInitializeEvent();

    expect(strapi.telemetry.send).toHaveBeenCalledWith('didInitializeMultishop', {
      numberOfContentTypes: 1,
    });
  });

  test('sendDidUpdateMultishopShopsEvent', async () => {
    global.strapi = {
      contentTypes: {
        withMultishop: {
          pluginOptions: {
            multishop: {
              shopEnabled: true,
            },
          },
        },
        withoutMultishop: {
          pluginOptions: {
            multishop: {
              shopEnabled: false,
            },
          },
        },
        withNoOption: {
          pluginOptions: {},
        },
      },
      plugins: {
        multishop: {
          services: {
            shops: {
              count: jest.fn(() => 3),
            },
          },
        },
      },
      telemetry: {
        send: jest.fn(),
      },
    };

    await sendDidUpdateMultishopShopsEvent();

    expect(strapi.telemetry.send).toHaveBeenCalledWith('didUpdateMultishopShops', {
      numberOfShops: 3,
    });
  });
});
