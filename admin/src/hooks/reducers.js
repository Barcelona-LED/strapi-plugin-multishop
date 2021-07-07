import produce from 'immer';
import set from 'lodash/set';
import pluginId from '../pluginId';
import { RESOLVE_SHOPS, ADD_SHOP, DELETE_SHOP, UPDATE_SHOP } from './constants';

export const initialState = {
  isLoading: true,
  shops: [],
};

const shopReducer = produce((draftState = initialState, action) => {
  switch (action.type) {
    case RESOLVE_SHOPS: {
      draftState.isLoading = false;
      draftState.shops = action.shops;
      break;
    }

    case ADD_SHOP: {
      if (action.newShop.isDefault) {
        draftState.shops.forEach(shop => {
          shop.isDefault = false;
        });
      }

      draftState.shops.push(action.newShop);
      break;
    }

    case DELETE_SHOP: {
      const shops = draftState.shops.filter(shop => shop.id !== action.id);

      set(draftState, 'shops', shops);
      break;
    }

    case UPDATE_SHOP: {
      if (action.editedShop.isDefault) {
        draftState.shops.forEach(shop => {
          shop.isDefault = false;
        });
      }

      const indexToEdit = draftState.shops.findIndex(
        shop => shop.id === action.editedShop.id
      );

      set(draftState.shops, indexToEdit, action.editedShop);
      break;
    }

    default:
      return draftState;
  }

  return draftState;
});

const reducers = {
  [`${pluginId}_shops`]: shopReducer,
};

export default reducers;
