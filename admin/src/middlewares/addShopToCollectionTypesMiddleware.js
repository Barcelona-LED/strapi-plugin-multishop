import addShopToLinksSearch from './utils/addShopToLinksSearch';

const addShopToCollectionTypesMiddleware = () => ({ getState }) => next => action => {
  if (action.type !== 'StrapiAdmin/LeftMenu/SET_CT_OR_ST_LINKS') {
    return next(action);
  }

  if (action.data.authorizedCtLinks.length) {
    const store = getState();
    const { shops } = store.get('multishop_shops');
    const { collectionTypesRelatedPermissions } = store.get('permissionsManager');

    action.data.authorizedCtLinks = addShopToLinksSearch(
      action.data.authorizedCtLinks,
      'collectionType',
      action.data.contentTypeSchemas,
      shops,
      collectionTypesRelatedPermissions
    );
  }

  return next(action);
};

export default addShopToCollectionTypesMiddleware;
