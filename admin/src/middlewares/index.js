import addCommonFieldsToInitialDataMiddleware from './addCommonFieldsToInitialDataMiddleware';
import addShopToCollectionTypesMiddleware from './addShopToCollectionTypesMiddleware';
import addShopToSingleTypesMiddleware from './addShopToSingleTypesMiddleware';
import extendCMEditViewLayoutMiddleware from './extendCMEditViewLayoutMiddleware';
import extendCTBInitialDataMiddleware from './extendCTBInitialDataMiddleware';
import extendCTBAttributeInitialDataMiddleware from './extendCTBAttributeInitialDataMiddleware';
import addShopColumnToListViewMiddleware from './addShopColumnToListViewMiddleware';
import shopPermissionMiddleware from './shopPermissionMiddleware';

const middlewares = [
  addCommonFieldsToInitialDataMiddleware,
  addShopToCollectionTypesMiddleware,
  addShopToSingleTypesMiddleware,
  extendCMEditViewLayoutMiddleware,
  extendCTBInitialDataMiddleware,
  extendCTBAttributeInitialDataMiddleware,
  addShopColumnToListViewMiddleware,
  shopPermissionMiddleware,
];

export default middlewares;
