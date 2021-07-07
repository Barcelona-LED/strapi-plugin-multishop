import { useEffect } from 'react';
import { request } from 'strapi-helper-plugin';
import { useSelector, useDispatch } from 'react-redux';
import { RESOLVE_SHOPS } from '../constants';

const fetchShopsList = async () => {
  try {
    const data = await request('/multishop/shops', {
      method: 'GET',
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

const useShops = () => {
  const dispatch = useDispatch();
  const shops = useSelector(state => state.get('multishop_shops').shops);
  const isLoading = useSelector(state => state.get('multishop_shops').isLoading);

  useEffect(() => {
    fetchShopsList().then(shops => dispatch({ type: RESOLVE_SHOPS, shops }));
  }, [dispatch]);

  return { shops, isLoading };
};

export default useShops;
