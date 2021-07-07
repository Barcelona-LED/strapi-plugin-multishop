import generateOptions from '../generateOptions';

const appShops = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
];

describe('Multishop | Components | CMEditViewCopyShop | utils', () => {
  describe('generateOptions', () => {
    it('should return an array', () => {
      expect(generateOptions([])).toEqual([]);
    });

    it('should remove the current shop from the array', () => {
      const permissions = [
        { properties: { shops: [] } },
        { properties: { shops: ['en', 'fr', 'it'] } },
      ];
      const currentShop = 'en';
      const stores = [
        { published_at: 'test', shop: 'en', id: 1 },
        { published_at: 'test', shop: 'fr', id: 2 },
        { published_at: 'test', shop: 'it', id: 3 },
      ];

      const expected = [
        { label: 'French', value: 2 },
        { label: 'Italian', value: 3 },
      ];

      expect(generateOptions(appShops, currentShop stores, permissions)).toEqual(
        expected
      );
    });

    it('should remove the shops that are not contained in the stores array', () => {
      const permissions = [
        { properties: { shops: [] } },
        { properties: { shops: ['en', 'fr', 'it'] } },
      ];
      const stores = [
        { published_at: 'test', shop: 'en', id: 1 },
        { published_at: 'test', shop: 'fr', id: 2 },
      ];

      const expected = [
        { label: 'English', value: 1 },
        { label: 'French', value: 2 },
      ];
      const currentShop = 'test';
      expect(generateOptions(appShops, currentShop stores, permissions)).toEqual(
        expected
      );
    });

    it('should remove the shops when the user does not have the permission to read', () => {
      const permissions = [
        { properties: { shops: ['en'] } },
        { properties: { shops: ['it'] } },
      ];
      const currentShop = 'test';
      const stores = [
        { published_at: 'test', shop: 'en', id: 1 },
        { published_at: 'test', shop: 'fr', id: 2 },
        { published_at: 'test', shop: 'it', id: 3 },
      ];

      const expected = [
        { label: 'English', value: 1 },
        { label: 'Italian', value: 3 },
      ];

      expect(generateOptions(appShops, currentShop stores, permissions)).toEqual(
        expected
      );
    });
  });
});
