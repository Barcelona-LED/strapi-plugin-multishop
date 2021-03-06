import React from 'react';
import { useIntl } from 'react-intl';
import { Pencil } from '@buffetjs/icons';
import { Text, IconLinks } from '@buffetjs/core';
import { CustomRow } from '@buffetjs/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getTrad } from '../../utils';

const ShopSettingsPage = ({ shop, onDelete, onEdit }) => {
  const { formatMessage } = useIntl();

  const links = [];

  if (onEdit) {
    links.push({
      icon: (
        <span aria-label={formatMessage({ id: getTrad('Settings.list.actions.edit') })}>
          <Pencil fill="#0e1622" />
        </span>
      ),
      onClick: () => onEdit(shop),
    });
  }

  if (onDelete && !shop.isDefault) {
    links.push({
      icon: !shop.isDefault ? (
        <span aria-label={formatMessage({ id: getTrad('Settings.list.actions.delete') })}>
          <FontAwesomeIcon icon="trash-alt" />
        </span>
      ) : null,
      onClick: e => {
        e.stopPropagation();
        onDelete(shop);
      },
    });
  }

  return (
    <CustomRow onClick={() => onEdit(shop)}>
      <td>
        <Text fontWeight="regular">{shop.name}</Text>
      </td>
      <td>
        <Text fontWeight="regular">{shop.url}</Text>
      </td>
      <td>
        <Text fontWeight="regular">{shop.default_locale && shop.default_locale.name}</Text>
      </td>
      <td>
        <Text>
          {shop.isDefault
            ? formatMessage({ id: getTrad('Settings.shops.row.default-shop') })
            : null}
        </Text>
      </td>
      <td>
        <IconLinks links={links} />
      </td>
    </CustomRow>
  );
};

export default ShopSettingsPage;
