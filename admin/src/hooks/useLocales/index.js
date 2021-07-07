import { request } from 'strapi-helper-plugin';
import { useQuery } from 'react-query';

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
  const { isLoading, data } = useQuery('locales', fetchLocalesList);

  return { locales: data, isLoading };
};

export default useLocales;
