import { useState } from 'react';
import { request } from 'strapi-helper-plugin';
import { useDispatch } from 'react-redux';
import { getTrad } from '../../utils';
import { DELETE_SHOP } from '../constants';

const deleteShop = async id => {
  try {
    const data = await request(`/multishop/shops/${id}`, {
      method: 'DELETE',
    });

    strapi.notification.toggle({
      type: 'success',
      message: { id: getTrad('Settings.shops.modal.delete.success') },
    });

    return data;
  } catch (e) {
    strapi.notification.toggle({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    return e;
  }
};

const useDeleteShop = () => {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const removeShop = async id => {
    setLoading(true);

    await deleteShop(id);

    dispatch({ type: DELETE_SHOP, id });
    setLoading(false);
  };

  return { isDeleting: isLoading, deleteShop: removeShop };
};

export default useDeleteShop;
