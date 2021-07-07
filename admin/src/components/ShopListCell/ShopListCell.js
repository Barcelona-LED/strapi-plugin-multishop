import React from 'react';
import PropTypes from 'prop-types';
import { Padded, Text } from '@buffetjs/core';
import { Tooltip } from '@buffetjs/styles';
import get from 'lodash/get';
import styled from 'styled-components';

const mapToShopName = (shops, shopCode) =>
  get(
    shops.find(({ code }) => code === shopCode),
    'name',
    shopCode
  );

const ShopName = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const ShopListCell = ({ shops, stores, shop: currentShopCode, id }) => {
  const allStores = [{ shop: currentShopCode }, ...stores];
  const storeNames = allStores.map(shop => shop.shop);
  const defaultShop = shops.find(shop => shop.isDefault);
  const hasDefaultShop = storeNames.includes(defaultShop.code);

  let shopsArray = [];

  if (hasDefaultShop) {
    const ctShopsWithoutDefault = storeNames.filter(
      shop => shop !== defaultShop.code
    );
    const ctShopsNamesWithoutDefault = ctShopsWithoutDefault.map(shop =>
      mapToShopName(shops, shop)
    );

    ctShopsNamesWithoutDefault.sort();

    const ctShopsNamesWithDefault = [
      `${defaultShop.name} (default)`,
      ...ctShopsNamesWithoutDefault,
    ];

    shopsArray = ctShopsNamesWithDefault;
  } else {
    const ctShops = storeNames.map(shop => mapToShopName(shops, shop));
    ctShops.sort();

    shopsArray = ctShops;
  }

  const elId = `entry-${id}__shop`;
  const shopsNames = shopsArray.join(', ');

  return (
    <div>
      <ShopName data-for={elId} data-tip={shopsNames}>
        {shopsNames}
      </ShopName>
      <Tooltip id={elId} place="bottom" delay={0}>
        {shopsArray.map(name => (
          <Padded key={name} top bottom size="xs">
            <Text ellipsis color="white">
              {name}
            </Text>
          </Padded>
        ))}
      </Tooltip>
    </div>
  );
};

ShopListCell.propTypes = {
  id: PropTypes.number.isRequired,
  stores: PropTypes.arrayOf(
    PropTypes.shape({
      shop: PropTypes.string.isRequired,
    })
  ).isRequired,
  shops: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      isDefault: PropTypes.bool,
    })
  ).isRequired,
  shop: PropTypes.string.isRequired,
};

export default ShopListCell;
