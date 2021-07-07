import { useSelector } from 'react-redux';
import get from 'lodash/get';

const selectContentManagerListViewPluginOptions = state =>
  state.get('content-manager_listView').contentType.pluginOptions;

const useHasMultishop = () => {
  const pluginOptions = useSelector(selectContentManagerListViewPluginOptions);

  return get(pluginOptions, 'multishop.shopEnabled', false);
};

export default useHasMultishop;
