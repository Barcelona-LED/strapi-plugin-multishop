import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { EmptyState, ListButton } from 'strapi-helper-plugin';
import { List } from '@buffetjs/custom';
import { Button } from '@buffetjs/core';
import { Plus } from '@buffetjs/icons';
import PropTypes from 'prop-types';
import useShops from '../../hooks/useShops';
import ShopRow from '../ShopRow';
import { getTrad } from '../../utils';
import ModalEdit from '../ModalEdit';
import ModalDelete from '../ModalDelete';
import ModalCreate from '../ModalCreate';

const ShopList = ({ canUpdateShop, canDeleteShop, onToggleCreateModal, isCreating }) => {
  const [shopToDelete, setShopToDelete] = useState();
  const [shopToEdit, setShopToEdit] = useState();
  const { shops, isLoading } = useShops();
  const { formatMessage } = useIntl();

  // Delete actions
  const closeModalToDelete = () => setShopToDelete(undefined);
  const handleDeleteShop = canDeleteShop ? setShopToDelete : undefined;

  // Edit actions
  const closeModalToEdit = () => {
    setShopToEdit(undefined);
  };
  const handleEditShop = canUpdateShop ? setShopToEdit : undefined;

  if (isLoading || (shops && shops.length > 0)) {
    const listTitle = isLoading
      ? null
      : formatMessage(
          {
            id: getTrad(
              `Settings.shops.list.title${shops.length > 1 ? '.plural' : '.singular'}`
            ),
          },
          { number: shops.length }
        );

    return (
      <>
        <List
          radius="2px"
          title={listTitle}
          items={shops}
          isLoading={isLoading}
          customRowComponent={shop => (
            <ShopRow shop={shop} onDelete={handleDeleteShop} onEdit={handleEditShop} />
          )}
        />

        <ModalCreate
          isOpened={isCreating}
          onClose={onToggleCreateModal}
          alreadyUsedShops={shops}
        />
        <ModalDelete shopToDelete={shopToDelete} onClose={closeModalToDelete} />
        <ModalEdit shopToEdit={shopToEdit} onClose={closeModalToEdit} />
      </>
    );
  }

  return (
    <>
      <EmptyState
        title={formatMessage({ id: getTrad('Settings.list.empty.title') })}
        description={formatMessage({ id: getTrad('Settings.list.empty.description') })}
      />

      {onToggleCreateModal && (
        <ListButton>
          <Button
            label={formatMessage({ id: getTrad('Settings.list.actions.add') })}
            onClick={onToggleCreateModal}
            color="primary"
            type="button"
            icon={<Plus fill="#007eff" width="11px" height="11px" />}
          />
        </ListButton>
      )}

      <ModalCreate isOpened={isCreating} onClose={onToggleCreateModal} />
    </>
  );
};

export default ShopList;
