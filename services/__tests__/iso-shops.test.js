'use strict';

const { getIsoShops } = require('../iso-shops');

describe('ISO shops', () => {
  test('getIsoShops', () => {
    const shops = getIsoShops();

    expect(shops).toMatchSnapshot();
  });
});
