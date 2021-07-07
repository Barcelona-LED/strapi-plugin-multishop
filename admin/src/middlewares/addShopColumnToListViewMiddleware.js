import React from 'react';
import get from 'lodash/get';
import ShopListCell from '../components/ShopListCell/ShopListCell';

const addShopColumnToListViewMiddleware = () => ({ getState }) => next => action => {
  if (action.type !== 'ContentManager/ListView/SET_LIST_LAYOUT ') {
    return next(action);
  }

  const isFieldShopEnabled = get(action, 'contentType.pluginOptions.multishop.shopEnabled', false);

  if (!isFieldShopEnabled) {
    return next(action);
  }

  const store = getState();
  const { shops } = store.get('multishop_shops');

  const shop = {
    key: '__shop_key__',
    fieldSchema: { type: 'string' },
    metadatas: { label: 'Content available in', searchable: false, sortable: false },
    name: 'shops',
    cellFormatter: props => <ShopListCell {...props} shops={shops} />,
  };

  action.displayedHeaders = [...action.displayedHeaders, shop];

  return next(action);
};

export default addShopColumnToListViewMiddleware;
