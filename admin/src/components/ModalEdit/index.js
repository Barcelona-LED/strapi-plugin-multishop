import React, { useRef } from 'react';
import PropTypes from 'prop-types';
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

const ModalEdit = ({ shopToEdit, onClose, shops }) => {
  const { isEditing, editShop } = useEditShop();
  const shouldUpdateMenu = useRef(false);
  const { updateMenu } = useGlobalContext();
  const { formatMessage } = useIntl();
  const isOpened = Boolean(shopToEdit);

  const handleSubmit = ({ displayName, isDefault }) => {
    const id = shopToEdit.id;
    const name = displayName || shopToEdit.code;

    return editShop(id, { name, isDefault })
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
    options = shops.map(shop => ({ label: shop.code, value: shop.id }));
    defaultOption = options.find(option => option.value === shopToEdit.id);
  }

  return (
    <Modal isOpen={isOpened} onToggle={onClose} onClosed={handleClose}>
      <Formik
        initialValues={{
          displayName: shopToEdit ? shopToEdit.name : '',
          isDefault: shopToEdit ? shopToEdit.isDefault : false,
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

ModalEdit.defaultProps = {
  shopToEdit: undefined,
  shops: [],
};

ModalEdit.propTypes = {
  shopToEdit: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    isDefault: PropTypes.bool.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
  shops: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      code: PropTypes.string,
    })
  ),
};

export default ModalEdit;
