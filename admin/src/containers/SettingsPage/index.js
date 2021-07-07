import React from 'react';
import { useUserPermissions } from 'strapi-helper-plugin';
import { useIntl } from 'react-intl';
import ShopSettingsPage from './ShopSettingsPage';
import multishopPermissions from '../../permissions';
import { getTrad } from '../../utils';

const ProtectedShopSettingsPage = () => {
  const { formatMessage } = useIntl();
  const {
    isLoading,
    allowedActions: { canRead, canUpdate, canCreate, canDelete },
  } = useUserPermissions(multishopPermissions);

  if (isLoading) {
    return (
      <div>
        <p>{formatMessage({ id: getTrad('Settings.permissions.loading') })}</p>
      </div>
    );
  }

  return (
    <ShopSettingsPage
      canReadShop={canRead}
      canCreateShop={canCreate}
      canUpdateShop={canUpdate}
      canDeleteShop={canDelete}
    />
  );
};

export default ProtectedShopSettingsPage;
