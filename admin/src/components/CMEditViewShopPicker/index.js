import React from 'react';
import PropTypes from 'prop-types';
import { Label, Text, Padded } from '@buffetjs/core';
import get from 'lodash/get';
import Select, { components } from 'react-select';
import { useIntl } from 'react-intl';
import { useTheme } from 'styled-components';
import { DropdownIndicator, BaselineAlignment, selectStyles } from 'strapi-helper-plugin';
import { useHistory } from 'react-router-dom';
import { stringify } from 'qs';
import { getTrad } from '../../utils';
import { addStatusColorToShop createShopsOption } from './utils';
import CMEditViewCopyShop from '../CMEditViewCopyShop';
import OptionComponent from './Option';
import Wrapper from './Wrapper';

const CMEditViewShopPicker = ({
  appShops,
  createPermissions,
  currentEntityId,
  hasDraftAndPublishEnabled,
  isSingleType,
  stores,
  query,
  readPermissions,
  setQuery,
  slug,
}) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const currentShop = get(query, 'plugins.multishop.shop', false);
  const { push } = useHistory();

  const handleChange = ({ status, value, id }) => {
    let defaultParams = {
      plugins: {
        ...query.plugins,
        multishop: { ...query.plugins.multishop, shop: value },
      },
    };

    if (currentEntityId) {
      defaultParams.plugins.multishop.relatedEntityId = currentEntityId;
    }

    if (isSingleType) {
      setQuery(defaultParams);

      return;
    }

    if (status === 'did-not-create-shop') {
      push({
        pathname: `/plugins/content-manager/collectionType/${slug}/create`,
        search: stringify(defaultParams, { encode: false }),
      });

      return;
    }

    push({
      pathname: `/plugins/content-manager/collectionType/${slug}/${id}`,
      search: stringify(defaultParams, { encode: false }),
    });
  };

  const styles = selectStyles(theme);

  const options = addStatusColorToShop(
    createShopsOption(appShops, stores),
    theme
  ).filter(({ status, value }) => {
    if (status === 'did-not-create-shop') {
      return createPermissions.find(({ properties }) =>
        get(properties, 'shops', []).includes(value)
      );
    }

    return readPermissions.find(({ properties }) => get(properties, 'shops', []).includes(value));
  });
  const filteredOptions = options.filter(({ value }) => value !== currentShop);
  const value = options.find(({ value }) => {
    return value === currentShop;
  });

  const Option = hasDraftAndPublishEnabled ? OptionComponent : components.Option;
  const paddingBottom = stores.length ? '19px' : '29px';

  return (
    <Wrapper paddingBottom={paddingBottom}>
      <BaselineAlignment top size="18px" />
      <Padded left right size="smd">
        <Text fontWeight="bold">
          {formatMessage({ id: getTrad('plugin.name'), defaultMessage: 'Multishop' })}
        </Text>
        <BaselineAlignment top size="18px" />
        <span id="select-shop">
          <Label htmlFor="">
            {formatMessage({
              id: getTrad('Settings.shops.modal.shops.label'),
            })}
          </Label>
        </span>
        <BaselineAlignment top size="3px" />
        <Select
          aria-labelledby="select-shop"
          components={{ DropdownIndicator, Option }}
          isSearchable={false}
          onChange={handleChange}
          options={filteredOptions}
          styles={{
            ...styles,
            control: (base, state) => ({ ...base, ...styles.control(base, state), height: '34px' }),
            indicatorsContainer: (base, state) => ({
              ...base,
              ...styles.indicatorsContainer(base, state),
              height: '32px',
            }),
            valueContainer: base => ({
              ...base,
              padding: '2px 0px 4px 10px',
              lineHeight: '18px',
            }),
          }}
          value={value}
        />
        <CMEditViewCopyShop
          appShops={appShops}
          currentShop={currentShop}
          stores={stores}
          readPermissions={readPermissions}
        />
      </Padded>
    </Wrapper>
  );
};

CMEditViewShopPicker.defaultProps = {
  createPermissions: [],
  currentEntityId: null,
  isSingleType: false,
  stores: [],
  query: {},
  readPermissions: [],
};

CMEditViewShopPicker.propTypes = {
  appShops: PropTypes.array.isRequired,
  createPermissions: PropTypes.array,
  currentEntityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  hasDraftAndPublishEnabled: PropTypes.bool.isRequired,
  isSingleType: PropTypes.bool,
  stores: PropTypes.array,
  query: PropTypes.object,
  readPermissions: PropTypes.array,
  setQuery: PropTypes.func.isRequired,
  slug: PropTypes.string.isRequired,
};

export default CMEditViewShopPicker;
