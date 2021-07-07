import reducers, { initialState } from '../reducers';
import { RESOLVE_SHOPS, ADD_SHOP, DELETE_SHOP, UPDATE_SHOP } from '../constants';

describe('multishop reducer', () => {
  it('resolves the initial state when the action is not known', () => {
    const action = {
      type: 'UNKNWON_ACTION',
    };

    const actual = reducers.multishop_shops(initialState, action);
    const expected = initialState;

    expect(actual).toEqual(expected);
  });

  it('resolves a list of shops when triggering RESOLVE_SHOPS', () => {
    const action = {
      type: RESOLVE_SHOPS,
      shops: [{ id: 1, displayName: 'French', isDefault: false }],
    };

    const actual = reducers.multishop_shops(initialState, action);
    const expected = {
      isLoading: false,
      shops: [
        {
          displayName: 'French',
          id: 1,
          isDefault: false,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('adds a shop when triggering ADD_SHOP', () => {
    const action = {
      type: ADD_SHOP,
      newShop: { id: 1, displayName: 'French', isDefault: false },
    };

    const actual = reducers.multishop_shops(initialState, action);
    const expected = {
      isLoading: true,
      shops: [
        {
          displayName: 'French',
          id: 1,
          isDefault: false,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('adds a shop when triggering ADD_SHOP and set it to default', () => {
    const action = {
      type: ADD_SHOP,
      newShop: { id: 1, displayName: 'French', isDefault: true },
    };

    const shops = [
      {
        displayName: 'English',
        id: 2,
        isDefault: true,
      },
    ];

    const actual = reducers.multishop_shops({ ...initialState, shops }, action);
    const expected = {
      isLoading: true,
      shops: [
        {
          displayName: 'English',
          id: 2,
          isDefault: false,
        },
        {
          displayName: 'French',
          id: 1,
          isDefault: true,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('removes a shop when triggering DELETE_SHOP ', () => {
    const action = {
      type: DELETE_SHOP,
      id: 2,
    };

    const shops = [
      {
        displayName: 'French',
        id: 1,
        isDefault: true,
      },
      {
        displayName: 'English',
        id: 2,
        isDefault: false,
      },
    ];

    const actual = reducers.multishop_shops({ ...initialState, shops }, action);
    const expected = {
      isLoading: true,
      shops: [
        {
          displayName: 'French',
          id: 1,
          isDefault: true,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('updates a shop when triggering UPDATE_SHOP', () => {
    const action = {
      type: UPDATE_SHOP,
      editedShop: { id: 1, displayName: 'Frenchie', isDefault: false },
    };

    const shops = [
      {
        displayName: 'English',
        id: 2,
        isDefault: true,
      },
      {
        displayName: 'French',
        id: 1,
        isDefault: false,
      },
    ];

    const actual = reducers.multishop_shops({ ...initialState, shops }, action);
    const expected = {
      isLoading: true,
      shops: [
        {
          displayName: 'English',
          id: 2,
          isDefault: true,
        },
        {
          displayName: 'Frenchie',
          id: 1,
          isDefault: false,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('updates a shop when triggering UPDATE_SHOP and set it to default', () => {
    const action = {
      type: UPDATE_SHOP,
      editedShop: { id: 1, displayName: 'Frenchie', isDefault: true },
    };

    const shops = [
      {
        displayName: 'English',
        id: 2,
        isDefault: true,
      },
      {
        displayName: 'French',
        id: 1,
        isDefault: false,
      },
    ];

    const actual = reducers.multishop_shops({ ...initialState, shops }, action);
    const expected = {
      isLoading: true,
      shops: [
        {
          displayName: 'English',
          id: 2,
          isDefault: false,
        },
        {
          displayName: 'Frenchie',
          id: 1,
          isDefault: true,
        },
      ],
    };

    expect(actual).toEqual(expected);
  });
});
