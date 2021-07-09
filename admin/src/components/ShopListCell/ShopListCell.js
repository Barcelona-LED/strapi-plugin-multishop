import React from 'react';
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
  const storeIds = allStores.map(shop => shop._id);
  const defaultShop = shops.find(shop => shop.isDefault);
  const hasDefaultShop = storeIds.includes(defaultShop._id);

  let shopsArray = [];

  if (hasDefaultShop) {
    const ctShopsWithoutDefault = storeIds.filter(
      shop => shop !== defaultShop._id
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
    const ctShops = storeIds.map(shop => mapToShopName(shops, shop));
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

export default ShopListCell;
