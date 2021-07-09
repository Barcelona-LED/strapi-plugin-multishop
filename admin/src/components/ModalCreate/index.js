import React, { useRef } from 'react';
import { Modal, ModalFooter, TabPanel, useUser } from 'strapi-helper-plugin';
import { useIntl } from 'react-intl';
import { Button } from '@buffetjs/core';
import { Formik } from 'formik';
import shopFormSchema from '../../schemas';
import { getTrad } from '../../utils';
import SettingsModal from '../SettingsModal';
import useAddShop from '../../hooks/useAddShop';
import BaseForm from './BaseForm';
import AdvancedForm from './AdvancedForm';
import useLocales from '../../hooks/useLocales';

const ModalCreate = ({ onClose, isOpened }) => {
  const { locales, isLoading } = useLocales();
  const { isAdding, addShop } = useAddShop();
  const { formatMessage } = useIntl();

  const { fetchUserPermissions } = useUser();
  const shouldUpdatePermissions = useRef(false);

  if (isLoading) {
    return (
      <div>
        <p>
          {formatMessage({ id: getTrad('Settings.shops.modal.create.defaultShops.loading') })}
        </p>
      </div>
    );
  }

  const options = (locales || [])
    .map(locale => ({
      label: locale.name,
      value: locale._id,
    }));

  const defaultOption = options[0];

  const handleClosed = async () => {
    if (shouldUpdatePermissions.current) {
      await fetchUserPermissions();
    }

    shouldUpdatePermissions.current = true;
  };

  return (
    <Modal isOpen={isOpened} onToggle={onClose} withoverflow="true" onClosed={handleClosed}>
      <Formik
        initialValues={{
          displayName: "",
          default_locale: defaultOption.value,
          url: "",
          isDefault: false,
        }}
        onSubmit={values =>
          addShop({
            default_locale: values.default_locale,
            name: values.displayName,
            url: values.url,
            isDefault: values.isDefault,
          })
            .then(() => {
              shouldUpdatePermissions.current = true;
            })
            .then(() => {
              onClose();
            })}
        validationSchema={shopFormSchema}
      >
        {({ handleSubmit, errors }) => (
          <form onSubmit={handleSubmit}>
            <SettingsModal
              title={formatMessage({
                id: getTrad('Settings.shops.modal.title'),
              })}
              breadCrumb={[formatMessage({ id: getTrad('Settings.list.actions.add') })]}
              tabsAriaLabel={formatMessage({
                id: getTrad('Settings.shops.modal.create.tab.label'),
              })}
              tabsId="multishop-settings-tabs-create"
            >
              <TabPanel>
                <BaseForm
                  locales={options}
                  defaultLocale={defaultOption}
                />
              </TabPanel>
              <TabPanel>
                <AdvancedForm />
              </TabPanel>
            </SettingsModal>

            <ModalFooter>
              <section>
                <Button type="button" color="cancel" onClick={onClose}>
                  {formatMessage({ id: 'app.components.Button.cancel' })}
                </Button>
                <Button
                  color="success"
                  type="submit"
                  isLoading={isAdding}
                  disabled={Object.keys(errors).length > 0}
                >
                  {formatMessage({ id: getTrad('Settings.shops.modal.create.confirmation') })}
                </Button>
              </section>
            </ModalFooter>
          </form>
        )}
      </Formik>
    </Modal>
  );
};

export default ModalCreate;
