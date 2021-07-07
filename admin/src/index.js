import React from 'react';
import get from 'lodash/get';
import * as yup from 'yup';
import pluginPkg from '../../package.json';
import pluginLogo from './assets/images/logo.svg';
import CheckboxConfirmation from './components/CheckboxConfirmation';
import CMEditViewInjectedComponents from './components/CMEditViewInjectedComponents';
import Initializer from './containers/Initializer';
import SettingsPage from './containers/SettingsPage';
import ShopPicker from './components/ShopPicker';
import middlewares from './middlewares';
import pluginPermissions from './permissions';
import pluginId from './pluginId';
import trads from './translations';
import { getTrad } from './utils';
import mutateCTBContentTypeSchema from './utils/mutateCTBContentTypeSchema';
import LOCALIZED_FIELDS from './utils/shopEnabledFields';
import multishopReducers from './hooks/reducers';
import DeleteModalAdditionalInfos from './components/DeleteModalAdditionalInfos';

export default strapi => {
  const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;

  middlewares.forEach(middleware => {
    strapi.middlewares.add(middleware);
  });

  const plugin = {
    description: pluginDescription,
    icon: pluginPkg.strapi.icon,
    id: pluginId,
    isReady: false,
    isRequired: pluginPkg.strapi.required || false,
    mainComponent: null,
    name: pluginPkg.strapi.name,
    pluginLogo,
    preventComponentRendering: false,
    settings: {
      global: {
        links: [
          {
            title: {
              id: getTrad('plugin.name'),
              defaultMessage: 'Multishop',
            },
            name: 'multishop',
            to: `${strapi.settingsBaseURL}/multishop`,
            Component: () => <SettingsPage />,
            permissions: pluginPermissions.accessMain,
          },
        ],
      },
    },
    trads,
    reducers: multishopReducers,
    boot(app) {
      const ctbPlugin = app.getPlugin('content-type-builder');
      const cmPlugin = app.getPlugin('content-manager');

      if (cmPlugin) {
        cmPlugin.injectComponent('editView', 'informations', {
          name: 'multishop-shop-filter-edit-view',
          Component: CMEditViewInjectedComponents,
        });
        cmPlugin.injectComponent('listView', 'actions', {
          name: 'multishop-shop-filter',
          Component: ShopPicker,
        });

        cmPlugin.injectComponent('listView', 'deleteModalAdditionalInfos', {
          name: 'multishop-delete-bullets-in-modal',
          Component: DeleteModalAdditionalInfos,
        });
      }

      if (ctbPlugin) {
        const ctbFormsAPI = ctbPlugin.apis.forms;
        ctbFormsAPI.addContentTypeSchemaMutation(mutateCTBContentTypeSchema);
        ctbFormsAPI.components.add({ id: 'checkboxConfirmation', component: CheckboxConfirmation });

        ctbFormsAPI.extendContentType({
          validator: () => ({
            multishop: yup.object().shape({
              shopEnabled: yup.bool(),
            }),
          }),
          form: {
            advanced() {
              return [
                [
                  {
                    name: 'pluginOptions.multishop.shopEnabled',
                    description: {
                      id: getTrad('plugin.schema.multishop.shopEnabled.description-content-type'),
                    },
                    type: 'checkboxConfirmation',
                    label: { id: getTrad('plugin.schema.multishop.shopEnabled.label-content-type') },
                  },
                ],
              ];
            },
          },
        });

        ctbFormsAPI.extendFields(LOCALIZED_FIELDS, {
          validator: args => ({
            multishop: yup.object().shape({
              shopEnabled: yup.bool().test({
                name: 'ensure-unique-store',
                message: getTrad('plugin.schema.multishop.ensure-unique-store'),
                test(value) {
                  if (value === undefined || value) {
                    return true;
                  }

                  const unique = get(args, ['3', 'modifiedData', 'unique'], null);

                  // Unique fields must be shopEnabled
                  if (unique && !value) {
                    return false;
                  }

                  return true;
                },
              }),
            }),
          }),
          form: {
            advanced({ contentTypeSchema, forTarget, type, step }) {
              if (forTarget !== 'contentType') {
                return [];
              }

              const hasMultishopEnabled = get(
                contentTypeSchema,
                ['schema', 'pluginOptions', 'multishop', 'shopEnabled'],
                false
              );

              if (!hasMultishopEnabled) {
                return [];
              }

              if (type === 'component' && step === '1') {
                return [];
              }

              return [
                [
                  {
                    name: 'pluginOptions.multishop.shopEnabled',
                    description: {
                      id: getTrad('plugin.schema.multishop.shopEnabled.description-field'),
                    },
                    type: 'checkbox',
                    label: { id: getTrad('plugin.schema.multishop.shopEnabled.label-field') },
                  },
                ],
              ];
            },
          },
        });
      }
    },
    initializer: Initializer,
  };

  return strapi.registerPlugin(plugin);
};
