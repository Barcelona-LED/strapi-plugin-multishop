import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Picker, Padded, Text, Flex } from '@buffetjs/core';
import { Carret, useQueryParams } from 'strapi-helper-plugin';
import { useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import get from 'lodash/get';
import useContentTypePermissions from '../../hooks/useContentTypePermissions';
import useHasMultishop from '../../hooks/useHasMultishop';
import selectMultishopShops from '../../selectors/selectMultishopShops';
import getInitialShop from '../../utils/getInitialShop';

const List = styled.ul`
  list-style-type: none;
  padding: 3px 0;
  margin: 0;
`;

const ListItem = styled.li`
  margin-top: 0;
  margin-bottom: 0;
  margin-left: -10px;
  margin-right: -10px;
  padding-left: 10px;
  padding-right: 10px;
  height: 36px;
  display: flex;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.main.colors.mediumGrey};
  }
`;

const EllipsisParagraph = styled(Text)`
  width: ${props => props.width};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: left;
`;

const ShopPicker = () => {
  const dispatch = useDispatch();
  const shops = useSelector(selectMultishopShops);
  const [{ query }, setQuery] = useQueryParams();
  const {
    params: { slug },
  } = useRouteMatch('/plugins/content-manager/collectionType/:slug');
  const isFieldShopEnabled = useHasMultishop();
  const { createPermissions, readPermissions } = useContentTypePermissions(slug);

  const initialShop = getInitialShop(query, shops);
  const [selected, setSelected] = useState(initialShop);

  if (!isFieldShopEnabled) {
    return null;
  }

  if (!shops || shops.length === 0) {
    return null;
  }

  const displayedShops = shops.filter(shop => {
    const canCreate = createPermissions.find(({ properties }) => {
      return get(properties, 'shops', []).includes(shop.code);
    });
    const canRead = readPermissions.find(({ properties }) =>
      get(properties, 'shops', []).includes(shop.code)
    );

    return canCreate || canRead;
  });

  return (
    <Picker
      position="right"
      renderButtonContent={isOpen => (
        <Flex>
          <EllipsisParagraph width="20ch">{selected.name}</EllipsisParagraph>

          <Padded left size="sm">
            <Carret fill={isOpen ? '#007eff' : '#292b2c'} isUp={isOpen} />
          </Padded>
        </Flex>
      )}
      renderSectionContent={onToggle => {
        const handleClick = shop => {
          dispatch({ type: 'ContentManager/RBACManager/RESET_PERMISSIONS' });
          setSelected(shop);

          setQuery({
            plugins: { ...query.plugins, multishop: { shop: shop.code } },
          });
          onToggle();
        };

        const hasMultipleShops = displayedShops.length > 1;

        return hasMultipleShops ? (
          <Padded left right>
            <List>
              {displayedShops.map(shop => {
                if (shop.id === selected.id) {
                  return null;
                }

                return (
                  <ListItem key={shop.id}>
                    <button onClick={() => handleClick(shop)} type="button">
                      <EllipsisParagraph width="200px">
                        {shop.name || shop.code}
                      </EllipsisParagraph>
                    </button>
                  </ListItem>
                );
              })}
            </List>
          </Padded>
        ) : null;
      }}
    />
  );
};

export default ShopPicker;
