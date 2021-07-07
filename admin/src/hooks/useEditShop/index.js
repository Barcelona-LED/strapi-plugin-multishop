import { useState } from 'react';
import { request } from 'strapi-helper-plugin';
import { useDispatch } from 'react-redux';
import { getTrad } from '../../utils';
import { UPDATE_SHOP } from '../constants';

const editShop = async (id, payload) => {
  try {
    const data = await request(`/multishop/shops/${id}`, {
      method: 'PUT',
      body: payload,
    });

    strapi.notification.toggle({
      type: 'success',
      message: { id: getTrad('Settings.shops.modal.edit.success') },
    });

    return data;
  } catch {
    strapi.notification.toggle({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    return null;
  }
};

const useEditShop = () => {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const modifyShop = async (id, payload) => {
    setLoading(true);

    const editedShop = await editShop(id, payload);

    dispatch({ type: UPDATE_SHOP, editedShop });
    setLoading(false);
  };

  return { isEditing: isLoading, editShop: modifyShop };
};

export default useEditShop;
