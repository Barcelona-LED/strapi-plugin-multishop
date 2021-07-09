import React, { useRef } from 'react';
import { Modal, ModalFooter, TabPanel, useGlobalContext } from 'strapi-helper-plugin';
import { useIntl } from 'react-intl';
import { Button } from '@buffetjs/core';
import { Formik } from 'formik';
import shopFormSchema from '../../schemas';
import useEditShop from '../../hooks/useEditShop';
import { getTrad } from '../../utils';
import BaseForm from './BaseForm';
import AdvancedForm from './AdvancedForm';
import SettingsModal from '../SettingsModal';
import useLocales from '../../hooks/useLocales';

const ModalEdit = ({ shopToEdit, onClose }) => {
  const { isEditing, editShop } = useEditShop();
  const shouldUpdateMenu = useRef(false);
  const { updateMenu } = useGlobalContext();
  const { formatMessage } = useIntl();
  const isOpened = Boolean(shopToEdit);
  const { locales, isLoading } = useLocales()

  if (isLoading) {
    return (
      <div>
        <p>
          {formatMessage({ id: getTrad('Settings.shops.modal.create.defaultShops.loading') })}
        </p>
      </div>
    );
  }

  const handleSubmit = ({ displayName, isDefault, default_locale, url }) => {
    const id = shopToEdit.id;
    const name = displayName || shopToEdit.name;

    return editShop(id, { name, isDefault, default_locale, url })
      .then(() => {
        shouldUpdateMenu.current = true;
      })
      .then(onClose);
  };

  const handleClose = () => {
    if (shouldUpdateMenu.current) {
      updateMenu();
    }

    shouldUpdateMenu.current = false;
  };

  let options = [];
  let defaultOption;

  if (shopToEdit) {
    options = locales.map(locale => ({ label: locale.code, value: locale.id }));
    defaultOption = options.find(option => option.value === shopToEdit.default_locale);
  }

  return (
    <Modal isOpen={isOpened} onToggle={onClose} onClosed={handleClose}>
      <Formik
        initialValues={{
          displayName: shopToEdit ? shopToEdit.name : '',
          isDefault: shopToEdit ? shopToEdit.isDefault : false,
          url: shopToEdit ? shopToEdit.url : false,
          default_code: shopToEdit ? shopToEdit.default_code : false
        }}
        onSubmit={handleSubmit}
        validationSchema={shopFormSchema}
      >
        {({ handleSubmit, errors }) => (
          <form onSubmit={handleSubmit}>
            <SettingsModal
              title={formatMessage({
                id: getTrad('Settings.shops.modal.title'),
              })}
              breadCrumb={[formatMessage({ id: getTrad('Settings.list.actions.edit') })]}
              tabsAriaLabel={formatMessage({
                id: getTrad('Settings.shops.modal.edit.tab.label'),
              })}
              tabsId="multishop-settings-tabs-edit"
            >
              <TabPanel>
                <BaseForm options={options} defaultOption={defaultOption} />
              </TabPanel>
              <TabPanel>
                <AdvancedForm isDefaultShop={Boolean(shopToEdit && shopToEdit.isDefault)} />
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
                  isLoading={isEditing}
                  disabled={Object.keys(errors).length > 0}
                >
                  {formatMessage({ id: getTrad('Settings.shops.modal.edit.confirmation') })}
                </Button>
              </section>
            </ModalFooter>
          </form>
        )}
      </Formik>
    </Modal>
  );
};

export default ModalEdit;
