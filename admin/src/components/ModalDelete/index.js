import React from 'react';
import PropTypes from 'prop-types';
import { Text } from '@buffetjs/core';
import { ModalConfirm } from 'strapi-helper-plugin';
import { useIntl } from 'react-intl';
import useDeleteShop from '../../hooks/useDeleteShop';
import { getTrad } from '../../utils';

const ModalDelete = ({ shopToDelete, onClose }) => {
  const { isDeleting, deleteShop } = useDeleteShop();
  const { formatMessage } = useIntl();
  const isOpened = Boolean(shopToDelete);

  const handleDelete = () => deleteShop(shopToDelete.id).then(onClose);

  return (
    <ModalConfirm
      confirmButtonLabel={{
        id: getTrad('Settings.shops.modal.delete.confirm'),
      }}
      showButtonLoader={isDeleting}
      isOpen={isOpened}
      toggle={onClose}
      onClosed={onClose}
      onConfirm={handleDelete}
      type="warning"
      content={{
        id: getTrad(`Settings.shops.modal.delete.message`),
      }}
    >
      <Text fontWeight="bold">
        {formatMessage({ id: getTrad('Settings.shops.modal.delete.secondMessage') })}
      </Text>
    </ModalConfirm>
  );
};

ModalDelete.defaultProps = {
  shopToDelete: undefined,
};

ModalDelete.propTypes = {
  shopToDelete: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default ModalDelete;
