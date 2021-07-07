import React from 'react';
import { Globe, GlobeCrossed } from '@buffetjs/icons';
import { getTrad } from '../../utils';
import extendCMEditViewLayoutMiddleware, {
  enhanceComponentsLayout,
  enhanceEditLayout,
  enhanceRelationLayout,
} from '../extendCMEditViewLayoutMiddleware';

const shopEnabledTrad = getTrad('Field.shopEnabled');
const shopEnabledTradDefaultMessage = 'This value is unique for the selected shop';
const notShopEnabledTrad = getTrad('Field.not-shopEnabled');
const notShopEnabledTradDefaultMessage = 'This value is common to all shops';

describe('multishop | Middlewares | extendCMEditViewLayoutMiddleware', () => {
  it('should forward the action if the type is undefined', () => {
    const middleware = extendCMEditViewLayoutMiddleware();
    const action = { test: true, type: undefined };

    const next = jest.fn();

    middleware()(next)(action);

    expect(next).toBeCalledWith(action);
  });

  it('should forward if the type is not correct', () => {
    const middleware = extendCMEditViewLayoutMiddleware();
    const action = { test: true, type: 'TEST' };

    const next = jest.fn();

    middleware()(next)(action);

    expect(next).toBeCalledWith(action);
  });

  describe('should forward when the type is ContentManager/EditViewLayoutManager/SET_LAYOUT', () => {
    it('should forward when multishop is not enabled on the content type', () => {
      const layout = {
        components: {},
        contentType: {
          uid: 'test',
          pluginOptions: { multishop: { shopEnabled: false } },
          layouts: {
            edit: ['test'],
          },
        },
      };
      const action = {
        type: 'ContentManager/EditViewLayoutManager/SET_LAYOUT',
        layout,
      };
      const middleware = extendCMEditViewLayoutMiddleware();
      const next = jest.fn();

      middleware()(next)(action);

      expect(next).toBeCalledWith(action);
    });

    it('should forward the action when multishop is enabled and the query.shop is not defined', () => {
      const layout = {
        contentType: {
          uid: 'test',
          pluginOptions: { multishop: { shopEnabled: true } },
          layouts: {
            edit: [],
            editRelations: [
              {
                fieldSchema: {},
                metadatas: {},
                name: 'addresses',
                queryInfos: {},
                size: 6,
                targetModelPluginOptions: {},
              },
            ],
          },
        },
      };

      const action = {
        type: 'ContentManager/EditViewLayoutManager/SET_LAYOUT',
        layout,
      };
      const middleware = extendCMEditViewLayoutMiddleware();

      const next = jest.fn();
      middleware()(next)(action);

      expect(next).toBeCalledWith(action);
    });

    it('should modify the editRelations layout when multishop is enabled and the query.shop is defined', () => {
      const layout = {
        contentType: {
          uid: 'test',
          pluginOptions: { multishop: { shopEnabled: true } },
          layouts: {
            edit: [],
            editRelations: [
              {
                fieldSchema: {},
                metadatas: {},
                name: 'addresses',
                queryInfos: {
                  test: true,
                  defaultParams: {},
                  paramsToKeep: ['plugins.multishop.shop'],
                },
                size: 6,
                targetModelPluginOptions: {},
              },
            ],
          },
        },
        components: {},
      };

      const action = {
        type: 'ContentManager/EditViewLayoutManager/SET_LAYOUT',
        layout,
        query: { plugins: { multishop: { shop: 'en' } } },
      };
      const middleware = extendCMEditViewLayoutMiddleware();

      const next = jest.fn();
      middleware()(next)(action);

      expect(next).toBeCalledWith({
        ...action,
        layout: {
          ...layout,
          contentType: {
            ...layout.contentType,
            layouts: {
              edit: [],
              editRelations: [
                {
                  fieldSchema: {},
                  metadatas: {},
                  name: 'addresses',
                  queryInfos: {
                    test: true,
                    defaultParams: {},
                    paramsToKeep: ['plugins.multishop.shop'],
                  },
                  size: 6,
                  targetModelPluginOptions: {},
                  labelIcon: {
                    title: { id: shopEnabledTrad, defaultMessage: shopEnabledTradDefaultMessage },
                    icon: <Globe />,
                  },
                },
              ],
            },
          },
        },
      });
    });
  });

  describe('enhanceComponentsLayout', () => {
    it('should not enhance the field when the type is not relation', () => {
      const components = {
        test: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'string' },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };
      const expected = {
        test: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'string' },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };

      expect(enhanceComponentsLayout(components)).toEqual(expected);
    });

    it('should not enhance the field when the type is relation and the targetModel.pluginOptions.i18.shopEnabled is disabled', () => {
      const components = {
        test: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { multishop: { shopEnabled: false } },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };
      const expected = {
        test: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { multishop: { shopEnabled: false } },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };

      expect(enhanceComponentsLayout(components)).toEqual(expected);
    });

    it('should modify the relation field when the targetModelPluginOptions.multishop.shopEnabled is enabled', () => {
      const components = {
        foo: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { multishop: { shopEnabled: true } },
                  queryInfos: {
                    defaultParams: { test: true },
                  },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
        bar: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { multishop: { shopEnabled: true } },
                  queryInfos: {
                    defaultParams: { test: true },
                  },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };
      const expected = {
        foo: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { multishop: { shopEnabled: true } },
                  queryInfos: {
                    defaultParams: { test: true, _shop: 'en' },
                    paramsToKeep: ['plugins.multishop.shop'],
                  },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
        bar: {
          test: true,
          layouts: {
            edit: [
              [
                {
                  name: 'title',
                  fieldSchema: { type: 'relation' },
                  targetModelPluginOptions: { multishop: { shopEnabled: true } },
                  queryInfos: {
                    defaultParams: { test: true, _shop: 'en' },
                    paramsToKeep: ['plugins.multishop.shop'],
                  },
                },
                {
                  name: 'content',
                  fieldSchema: { type: 'string' },
                },
              ],
            ],
          },
        },
      };

      expect(enhanceComponentsLayout(components, 'en')).toEqual(expected);
    });
  });

  describe('enhanceEditLayout', () => {
    it('should add the label icon to all fields with the shopEnabled translation when multishop is enabled', () => {
      const edit = [
        [
          {
            name: 'name',
            size: 6,
            fieldSchema: {
              pluginOptions: { multishop: { shopEnabled: true } },
              type: 'string',
            },
          },
        ],
        [
          {
            name: 'test',
            size: 6,
            fieldSchema: {
              pluginOptions: { multishop: { shopEnabled: true } },
              type: 'string',
            },
          },
          {
            name: 'slug',
            size: 6,
            fieldSchema: {
              type: 'uid',
            },
          },
        ],
      ];
      const expected = [
        [
          {
            name: 'name',
            size: 6,
            fieldSchema: {
              pluginOptions: { multishop: { shopEnabled: true } },
              type: 'string',
            },
            labelIcon: {
              title: { id: shopEnabledTrad, defaultMessage: shopEnabledTradDefaultMessage },
              icon: <Globe />,
            },
          },
        ],
        [
          {
            name: 'test',
            size: 6,
            fieldSchema: {
              pluginOptions: { multishop: { shopEnabled: true } },
              type: 'string',
            },
            labelIcon: {
              title: { id: shopEnabledTrad, defaultMessage: shopEnabledTradDefaultMessage },
              icon: <Globe />,
            },
          },
          {
            name: 'slug',
            size: 6,
            fieldSchema: {
              type: 'uid',
            },
            labelIcon: {
              title: { id: shopEnabledTrad, defaultMessage: shopEnabledTradDefaultMessage },
              icon: <Globe />,
            },
          },
        ],
      ];

      expect(enhanceEditLayout(edit)).toEqual(expected);
    });

    it('should add the label icon to all fields with the not shopEnabled translation when multishop is disabled', () => {
      const edit = [
        [
          {
            name: 'name',
            size: 6,
            fieldSchema: {
              pluginOptions: { multishop: { shopEnabled: true } },
              type: 'string',
            },
          },
        ],
        [
          {
            name: 'test',
            size: 6,
            fieldSchema: {
              pluginOptions: { multishop: { shopEnabled: false } },
              type: 'string',
            },
          },
        ],
      ];
      const expected = [
        [
          {
            name: 'name',
            size: 6,
            fieldSchema: {
              pluginOptions: { multishop: { shopEnabled: true } },
              type: 'string',
            },
            labelIcon: {
              title: { id: shopEnabledTrad, defaultMessage: shopEnabledTradDefaultMessage },
              icon: <Globe />,
            },
          },
        ],
        [
          {
            name: 'test',
            size: 6,
            fieldSchema: {
              pluginOptions: { multishop: { shopEnabled: false } },
              type: 'string',
            },
            labelIcon: {
              title: { id: notShopEnabledTrad, defaultMessage: notShopEnabledTradDefaultMessage },
              icon: <GlobeCrossed />,
            },
          },
        ],
      ];

      expect(enhanceEditLayout(edit)).toEqual(expected);
    });
  });

  describe('enhanceRelationLayout', () => {
    it('should add the labelIcon key to all relations fields', () => {
      const editRelations = [
        {
          fieldSchema: {},
          metadatas: {},
          name: 'addresses',
          queryInfos: {},
          size: 6,
          targetModelPluginOptions: {},
        },
      ];
      const expected = [
        {
          fieldSchema: {},
          metadatas: {},
          name: 'addresses',
          queryInfos: {},
          size: 6,
          targetModelPluginOptions: {},
          labelIcon: {
            title: { id: shopEnabledTrad, defaultMessage: shopEnabledTradDefaultMessage },
            icon: <Globe />,
          },
        },
      ];

      expect(enhanceRelationLayout(editRelations, 'en')).toEqual(expected);
    });

    it('should add the shop to the queryInfos.defaultParams when the targetModelPluginOptions.multishop.shopEnabled is enabled', () => {
      const editRelations = [
        {
          fieldSchema: {},
          metadatas: {},
          name: 'addresses',
          queryInfos: {
            defaultParams: {
              test: true,
            },
          },
          size: 6,
          targetModelPluginOptions: {
            multishop: { shopEnabled: true },
          },
        },
      ];
      const expected = [
        {
          fieldSchema: {},
          metadatas: {},
          name: 'addresses',
          queryInfos: {
            defaultParams: {
              test: true,
              _shop: 'en',
            },
            paramsToKeep: ['plugins.multishop.shop'],
          },
          size: 6,
          targetModelPluginOptions: {
            multishop: { shopEnabled: true },
          },
          labelIcon: {
            title: { id: shopEnabledTrad, defaultMessage: shopEnabledTradDefaultMessage },
            icon: <Globe />,
          },
        },
      ];

      expect(enhanceRelationLayout(editRelations, 'en')).toEqual(expected);
    });
  });
});
