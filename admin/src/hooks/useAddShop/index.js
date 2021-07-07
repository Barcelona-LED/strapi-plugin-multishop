import { useState } from 'react';
import { request } from 'strapi-helper-plugin';
import { useDispatch } from 'react-redux';
import get from 'lodash/get';
import { getTrad } from '../../utils';
import { ADD_SHOP } from '../constants';

const addShop = async ({ name, url, isDefault }) => {
  const data = await request(`/multishop/shops`, {
    method: 'POST',
    body: {
      name,
      url,
      isDefault,
    },
  });

  strapi.notification.toggle({
    type: 'success',
    message: { id: getTrad('Settings.shops.modal.create.success') },
  });

  return data;
};

const useAddShop = () => {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const persistShop = async shop => {
    setLoading(true);

    try {
      const newShop = await addShop(shop);
      dispatch({ type: ADD_SHOP, newShop });
    } catch (e) {
      const message = get(e, 'response.payload.message', null);

      if (message && message.includes('already exists')) {
        strapi.notification.toggle({
          type: 'warning',
          message: { id: getTrad('Settings.shops.modal.create.alreadyExist') },
        });
      } else {
        strapi.notification.toggle({
          type: 'warning',
          message: { id: 'notification.error' },
        });
      }

      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { isAdding: isLoading, addShop: persistShop };
};

export default useAddShop;
