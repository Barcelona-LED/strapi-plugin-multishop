import { request } from 'strapi-helper-plugin';
import { useSelector, useDispatch } from 'react-redux';

const fetchLocalesList = async () => {
  try {
    const data = await request('/i18n/locales', {
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

const useLocales = () => {
  const locales = useSelector(state => state.get('i18n_locales').locales);
  const isLoading = useSelector(state => state.get('i18n_locales').isLoading);

  return { locales, isLoading };
};

export default useLocales;
