import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { BaselineAlignment } from 'strapi-helper-plugin';
import { Header } from '@buffetjs/custom';
import { Button } from '@buffetjs/core';
import { getTrad } from '../../utils';
import ShopList from '../../components/ShopList';

const ShopSettingsPage = ({
  canReadShop,
  canCreateShop,
  canDeleteShop,
  canUpdateShop,
}) => {
  const { formatMessage } = useIntl();
  const [isOpenedCreateModal, setIsOpenedCreateModal] = useState(false);

  const handleToggleModalCreate = canCreateShop
    ? () => setIsOpenedCreateModal(s => !s)
    : undefined;

  const actions = [
    {
      label: formatMessage({ id: getTrad('Settings.list.actions.add') }),
      onClick: handleToggleModalCreate,
      color: 'primary',
      type: 'button',
      icon: true,
      Component: props => (canCreateShop ? <Button {...props} /> : null),
      style: {
        paddingLeft: 15,
        paddingRight: 15,
      },
    },
  ];

  return (
    <>
      <Header
        title={{
          label: formatMessage({ id: getTrad('plugin.name') }),
        }}
        content={formatMessage({ id: getTrad('Settings.list.description') })}
        actions={actions}
      />

      <BaselineAlignment top size="3px" />

      {canReadShop ? (
        <ShopList
          canUpdateShop={canUpdateShop}
          canDeleteShop={canDeleteShop}
          onToggleCreateModal={handleToggleModalCreate}
          isCreating={isOpenedCreateModal}
        />
      ) : null}
    </>
  );
};

ShopSettingsPage.propTypes = {
  canReadShop: PropTypes.bool.isRequired,
  canCreateShop: PropTypes.bool.isRequired,
  canUpdateShop: PropTypes.bool.isRequired,
  canDeleteShop: PropTypes.bool.isRequired,
};

export default ShopSettingsPage;
