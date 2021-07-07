import addShopColumnToListViewMiddleware from '../addShopColumnToListViewMiddleware';

describe('addShopColumnToListViewMiddleware', () => {
  let getState;

  beforeEach(() => {
    const store = new Map();

    store.set('multishop_shops', { shops: [] });

    getState = () => store;
  });

  it('does nothing on unknown actions', () => {
    const middleware = addShopColumnToListViewMiddleware()({ getState });
    const nextFn = jest.fn();
    const action = { type: 'UNKNOWN' };

    middleware(nextFn)(action);

    expect(nextFn).toBeCalledWith(action);
    expect(action).toEqual({
      type: 'UNKNOWN',
    });
  });

  it('does nothing when there s no multishop.shopEnabled key in the action', () => {
    const middleware = addShopColumnToListViewMiddleware()({ getState });
    const nextFn = jest.fn();
    const action = {
      type: 'ContentManager/ListView/SET_LIST_LAYOUT ',
      contentType: { pluginOptions: {} },
    };

    middleware(nextFn)(action);

    expect(nextFn).toBeCalledWith(action);
    expect(action).toEqual({
      contentType: { pluginOptions: {} },
      type: 'ContentManager/ListView/SET_LIST_LAYOUT ',
    });
  });

  it('adds a header to the displayedHeaders array when the content type is shopEnabled', () => {
    const middleware = addShopColumnToListViewMiddleware()({ getState });
    const nextFn = jest.fn();
    const action = {
      type: 'ContentManager/ListView/SET_LIST_LAYOUT ',
      displayedHeaders: [],
      contentType: {
        pluginOptions: {
          multishop: { shopEnabled: true },
        },
      },
    };

    middleware(nextFn)(action);

    expect(nextFn).toBeCalledWith(action);
    // The anonymous function of cellFormatter creates problem, because it's anonymous
    // In our scenario, it's even more tricky because we use a closure in order to pass
    // the shops.
    // Stringifying the action allows us to have a name inside the expectation for the "cellFormatter" key
    expect(JSON.stringify(action)).toBe(
      '{"type":"ContentManager/ListView/SET_LIST_LAYOUT ","displayedHeaders":[{"key":"__shop_key__","fieldSchema":{"type":"string"},"metadatas":{"label":"Content available in","searchable":false,"sortable":false},"name":"shops"}],"contentType":{"pluginOptions":{"multishop":{"shopEnabled":true}}}}'
    );
  });
});
