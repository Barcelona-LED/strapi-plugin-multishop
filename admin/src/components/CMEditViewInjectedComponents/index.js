import React, { useMemo } from 'react';
import get from 'lodash/get';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useContentManagerEditViewDataManager, useQueryParams } from 'strapi-helper-plugin';
import selectMultishopShops from '../../selectors/selectMultishopShops';
import useContentTypePermissions from '../../hooks/useContentTypePermissions';
import CMEditViewShopPicker from '../CMEditViewShopPicker';

const CMEditViewInjectedComponents = () => {
  const { layout, modifiedData, slug, isSingleType } = useContentManagerEditViewDataManager();
  const { createPermissions, readPermissions } = useContentTypePermissions(slug);
  const shops = useSelector(selectMultishopShops);
  const params = useParams();
  const [{ query }, setQuery] = useQueryParams();

  const id = get(params, 'id', null);
  const currentEntityId = id;
  const defaultShop = shops.find(loc => loc.isDefault);
  const currentShop = get(query, 'plugins.multishop.shop', defaultShop.code);
  const hasMultishopEnabled = get(layout, ['pluginOptions', 'multishop', 'shopEnabled'], false);
  const hasDraftAndPublishEnabled = get(layout, ['options', 'draftAndPublish'], false);

  const defaultQuery = useMemo(() => {
    if (!query) {
      return { plugins: { multishop: { shop: currentShop } } };
    }

    return query;
  }, [query, currentShop]);

  if (!hasMultishopEnabled) {
    return null;
  }

  if (!currentShop) {
    return null;
  }

  const stores = get(modifiedData, 'stores', []);

  return (
    <CMEditViewShopPicker
      appShops={shops}
      currentEntityId={currentEntityId}
      createPermissions={createPermissions}
      hasDraftAndPublishEnabled={hasDraftAndPublishEnabled}
      stores={stores}
      isSingleType={isSingleType}
      query={defaultQuery}
      readPermissions={readPermissions}
      setQuery={setQuery}
      slug={slug}
    />
  );
};

export default CMEditViewInjectedComponents;
