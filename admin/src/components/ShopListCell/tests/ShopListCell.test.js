import React from 'react';
import { render, screen } from '@testing-library/react';
import ShopListCell from '../ShopListCell';

jest.mock('@buffetjs/styles', () => ({
  Tooltip: () => null,
}));

jest.mock('@buffetjs/core', () => ({
  Padded: props => <div {...props} />,
  Text: props => <p {...props} />,
}));

describe('ShopListCell', () => {
  it('returns the default shop first, then the others sorted alphabetically', () => {
    const shops = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        created_at: '2021-03-09T14:57:03.016Z',
        updated_at: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French',
        code: 'fr-FR',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Arabic',
        code: 'ar',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    const shop = 'en';
    const stores = [{ shop: 'fr-FR' }, { shop: 'ar' }];

    render(
      <ShopListCell id={12} shops={shops} shop={shop} stores={stores} />
    );

    expect(screen.getByText('French (default), Arabic, English')).toBeVisible();
  });

  it('returns the "ar" when there s 2 shops available', () => {
    const shops = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        created_at: '2021-03-09T14:57:03.016Z',
        updated_at: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French',
        code: 'fr-FR',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Arabic',
        code: 'ar',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    const shop = 'en';
    const stores = [{ shop: 'ar' }];

    render(
      <ShopListCell id={12} shops={shops} shop={shop} stores={stores} />
    );

    expect(screen.getByText('Arabic, English')).toBeVisible();
  });

  it('returns the "ar" and "en" shops  alphabetically sorted', () => {
    const shops = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        created_at: '2021-03-09T14:57:03.016Z',
        updated_at: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French',
        code: 'fr-FR',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Arabic',
        code: 'ar',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    const shop = 'fr-FR';
    const stores = [{ shop: 'en' }, { shop: 'ar' }];

    render(
      <ShopListCell id={12} shops={shops} shop={shop} stores={stores} />
    );

    expect(screen.getByText('French (default), Arabic, English')).toBeVisible();
  });
});
