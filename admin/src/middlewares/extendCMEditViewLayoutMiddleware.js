import React from 'react';
import get from 'lodash/get';
import StoreIcon from '@material-ui/icons/Store';
import StoreOutlinedIcon from '@material-ui/icons/StoreOutlined';
import { Globe, GlobeCrossed } from '@buffetjs/icons';
import { getTrad } from '../utils';

const enhanceRelationLayout = (layout, shop) =>
  layout.map(current => {
    const labelIcon = {
      title: {
        id: getTrad('Field.shopEnabled'),
        defaultMessage: 'This value is unique for the selected shop',
      },
      icon: <StoreIcon />,
    };
    let queryInfos = current.queryInfos;

    if (get(current, ['targetModelPluginOptions', 'multishop', 'shopEnabled'], false)) {
      queryInfos = {
        ...queryInfos,
        defaultParams: { ...queryInfos.defaultParams, _shop: shop },
        paramsToKeep: ['plugins.multishop.shop'],
      };
    }

    return { ...current, labelIcon, queryInfos };
  });

const enhanceEditLayout = layout =>
  layout.map(row => {
    const enhancedRow = row.reduce((acc, field) => {
      const type = get(field, ['fieldSchema', 'type'], null);
      const hasMultishopEnabled = get(
        field,
        ['fieldSchema', 'pluginOptions', 'multishop', 'shopEnabled'],
        type === 'uid'
      );

      const isLocalized = get(
        field,
        ['fieldSchema', 'pluginOptions', 'i18n', 'localized'],
        type === 'uid'
      );

      const labelIcon = {
        title: {
          id: hasMultishopEnabled ? (isLocalized ? getTrad('Field.shopEnabledAndLocale') : getTrad('Field.shopEnabled')) :  (isLocalized ? getTrad('Field.not-shopEnabledAndLocale') : getTrad('Field.not-shopEnabled')) ,
          defaultMessage: hasMultishopEnabled
            ? `This value is unique for the selected shop ${isLocalized && ' and selected locale'}`
            : `This value is common to all shops ${isLocalized && ' but unique for selected locale'}`,
        },
        icon: <>{hasMultishopEnabled ? <StoreIcon />  : <StoreOutlinedIcon />}{isLocalized ? <Globe /> : <GlobeCrossed />}</>,
      };

      acc.push({ ...field, labelIcon });

      return acc;
    }, []);

    return enhancedRow;
  });

const enhanceComponentsLayout = (components, shop) => {
  return Object.keys(components).reduce((acc, current) => {
    const currentComponentLayout = components[current];

    const enhancedEditLayout = enhanceComponentLayoutForRelations(
      currentComponentLayout.layouts.edit,
      shop
    );

    acc[current] = {
      ...currentComponentLayout,
      layouts: { ...currentComponentLayout.layouts, edit: enhancedEditLayout },
    };

    return acc;
  }, {});
};

const enhanceComponentLayoutForRelations = (layout, shop) =>
  layout.map(row => {
    const enhancedRow = row.reduce((acc, field) => {
      if (
        get(field, ['fieldSchema', 'type']) === 'relation' &&
        get(field, ['targetModelPluginOptions', 'multishop', 'shopEnabled'], false)
      ) {
        const queryInfos = {
          ...field.queryInfos,
          defaultParams: { ...field.queryInfos.defaultParams, _shop: shop },
          paramsToKeep: ['plugins.multishop.shop'],
        };

        acc.push({ ...field, queryInfos });

        return acc;
      }

      acc.push({ ...field });

      return acc;
    }, []);

    return enhancedRow;
  });

const extendCMEditViewLayoutMiddleware = () => () => next => action => {
  if (action.type !== 'ContentManager/EditViewLayoutManager/SET_LAYOUT') {
    return next(action);
  }

  const hasmultishopEnabled = get(
    action,
    getPathToContentType(['pluginOptions', 'multishop', 'shopEnabled']),
    false
  );

  if (!hasmultishopEnabled) {
    return next(action);
  }

  const currentShop = get(action, ['query', 'plugins', 'multishop', 'shop'], null);

  // This might break the cm, has the user might be redirected to the homepage
  if (!currentShop) {
    return next(action);
  }

  const editLayoutPath = getPathToContentType(['layouts', 'edit']);
  const editRelationsPath = getPathToContentType(['layouts', 'editRelations']);
  const editLayout = get(action, editLayoutPath);
  const editRelationsLayout = get(action, editRelationsPath);
  const nextEditRelationLayout = enhanceRelationLayout(editRelationsLayout, currentShop);
  const nextEditLayout = enhanceEditLayout(editLayout);

  const enhancedLayouts = {
    ...action.layout.contentType.layouts,
    editRelations: nextEditRelationLayout,
    edit: nextEditLayout,
  };
  const components = enhanceComponentsLayout(action.layout.components, currentShop);

  const enhancedAction = {
    ...action,
    layout: {
      ...action.layout,
      contentType: {
        ...action.layout.contentType,
        layouts: enhancedLayouts,
      },
      components,
    },
  };

  return next(enhancedAction);
};

const getPathToContentType = pathArray => ['layout', 'contentType', ...pathArray];

export default extendCMEditViewLayoutMiddleware;
export {
  enhanceComponentLayoutForRelations,
  enhanceComponentsLayout,
  enhanceEditLayout,
  enhanceRelationLayout,
};
