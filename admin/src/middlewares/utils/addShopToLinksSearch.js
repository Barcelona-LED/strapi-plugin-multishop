import get from 'lodash/get';
import { stringify, parse } from 'qs';
import getDefaultShop from '../../utils/getDefaultShop';

const addShopToLinksSearch = (links, kind, contentTypeSchemas, shops, permissions) => {
  return links.map(link => {
    const contentTypeUID = link.destination.split(`/${kind}/`)[1];

    const contentTypeSchema = contentTypeSchemas.find(({ uid }) => uid === contentTypeUID);

    const hasMultishopEnabled = get(contentTypeSchema, 'pluginOptions.multishop.shopEnabled', false);

    if (!hasMultishopEnabled) {
      return link;
    }

    const contentTypePermissions = permissions[contentTypeUID];
    const requiredPermissionsToViewALink =
      kind === 'collectionType'
        ? ['plugins::content-manager.explorer.read', 'plugins::content-manager.explorer.create']
        : ['plugins::content-manager.explorer.read'];

    const contentTypeNeededPermissions = Object.keys(contentTypePermissions).reduce(
      (acc, current) => {
        if (requiredPermissionsToViewALink.includes(current)) {
          acc[current] = contentTypePermissions[current];

          return acc;
        }

        acc[current] = [];

        return acc;
      },
      {}
    );

    const defaultShop = getDefaultShop(contentTypeNeededPermissions, shops);

    if (!defaultShop) {
      return { ...link, isDisplayed: false };
    }

    const linkParams = link.search ? parse(link.search) : {};

    const params = linkParams
      ? { ...linkParams, plugins: { ...linkParams.plugins, multishop: { shop: defaultShop } } }
      : { plugins: { multishop: { shop: defaultShop } } };

    const search = stringify(params, { encode: false });

    return { ...link, search };
  });
};

export default addShopToLinksSearch;
