import addShopToLinksSearch from './utils/addShopToLinksSearch';

const addShopToSingleTypesMiddleware = () => ({ getState }) => next => action => {
  if (action.type !== 'StrapiAdmin/LeftMenu/SET_CT_OR_ST_LINKS') {
    return next(action);
  }

  if (action.data.authorizedStLinks.length) {
    const store = getState();
    const { shops } = store.get('multishop_shops');
    const { collectionTypesRelatedPermissions } = store.get('permissionsManager');

    action.data.authorizedStLinks = addShopToLinksSearch(
      action.data.authorizedStLinks,
      'singleType',
      action.data.contentTypeSchemas,
      shops,
      collectionTypesRelatedPermissions
    );
  }

  return next(action);
};

export default addShopToSingleTypesMiddleware;
