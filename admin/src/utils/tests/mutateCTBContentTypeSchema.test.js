import mutateSchema, {
  addMultishopToFields,
  disableAttributesMultishop,
} from '../mutateCTBContentTypeSchema';

describe('multishop | utils ', () => {
  describe('mutateCTBContentTypeSchema', () => {
    it('should forward the data the pluginOptions.multishop.shopEnabled key does not exist in the content type', () => {
      const data = { pluginOptions: { test: true } };

      expect(mutateSchema(data)).toEqual(data);
    });

    it('should remove the pluginOptions.multishop key from the content type schema', () => {
      const ctSchema = {
        pluginOptions: {
          pluginA: { foo: 'bar' },
          multishop: { shopEnabled: false },
          pluginB: { foo: 'bar' },
        },
        kind: 'test',
        attributes: {
          one: {
            type: 'string',
            pluginOptions: {
              multishop: { shopEnabled: true },
            },
            required: true,
          },
          two: {
            type: 'number',
            pluginOptions: {
              pluginA: { test: true },
              multishop: { shopEnabled: true },
            },
          },
        },
      };

      const expected = {
        pluginOptions: {
          pluginA: { foo: 'bar' },
          pluginB: { foo: 'bar' },
        },
        kind: 'test',
        attributes: {
          one: {
            type: 'string',
            pluginOptions: {},
            required: true,
          },
          two: {
            type: 'number',
            pluginOptions: {
              pluginA: { test: true },
            },
          },
        },
      };

      expect(mutateSchema(ctSchema, {})).toEqual(expected);
    });

    it('should return the data if the initial schema already has multishop enabled', () => {
      const ctSchema = {
        pluginOptions: {
          pluginA: { foo: 'bar' },
          multishop: { shopEnabled: true },
          pluginB: { foo: 'bar' },
        },
        kind: 'test',
        attributes: {
          one: {
            type: 'string',
            pluginOptions: {
              multishop: { shopEnabled: true },
            },
            required: true,
          },
          two: {
            type: 'number',
            pluginOptions: {
              pluginA: { test: true },
              multishop: { shopEnabled: true },
            },
          },
        },
      };

      expect(
        mutateSchema(ctSchema, {
          schema: {
            pluginOptions: {
              pluginA: { foo: 'bar' },
              multishop: { shopEnabled: true },
              pluginB: { foo: 'bar' },
            },
          },
        })
      ).toEqual(ctSchema);
    });

    it('should set the pluginOptions.multishop.shopEnabled to true an all attributes', () => {
      const nextSchema = {
        pluginOptions: { pluginA: { ok: true }, multishop: { shopEnabled: true } },
        attributes: {
          cover: { type: 'media', pluginOptions: { pluginA: { ok: true } } },
          name: {
            type: 'text',
            pluginOptions: { pluginA: { ok: true }, multishop: { shopEnabled: false } },
          },
          price: {
            type: 'text',
          },
        },
      };
      const expected = {
        pluginOptions: { pluginA: { ok: true }, multishop: { shopEnabled: true } },
        attributes: {
          cover: {
            type: 'media',
            pluginOptions: { pluginA: { ok: true }, multishop: { shopEnabled: true } },
          },
          name: {
            type: 'text',
            pluginOptions: { pluginA: { ok: true }, multishop: { shopEnabled: true } },
          },
          price: {
            type: 'text',
            pluginOptions: { multishop: { shopEnabled: true } },
          },
        },
      };

      expect(mutateSchema(nextSchema, {})).toEqual(expected);
    });
  });

  describe('multishop addMultishopToFields', () => {
    it('should forward the data if the attribute type is not correct', () => {
      const attributes = {
        foo: { type: 'relation' },
        bar: { type: 'custom' },
      };

      expect(addMultishopToFields(attributes)).toEqual(attributes);
    });

    it('should keep the pluginOptions for each attribute and enable the multishop.shopEnabled value', () => {
      const attributes = {
        foo: { type: 'text', pluginOptions: { pluginA: { ok: true } }, required: true },
        bar: { type: 'text', pluginOptions: { multishop: { shopEnabled: false } } },
      };

      const expected = {
        foo: {
          type: 'text',
          pluginOptions: { pluginA: { ok: true }, multishop: { shopEnabled: true } },
          required: true,
        },
        bar: { type: 'text', pluginOptions: { multishop: { shopEnabled: true } } },
      };

      expect(addMultishopToFields(attributes)).toEqual(expected);
    });

    it('should enable the pluginOptions.multishop.shopEnabled value for each attribute', () => {
      const attributes = {
        foo: { type: 'text', required: true },
        bar: { type: 'text' },
      };

      const expected = {
        foo: {
          type: 'text',
          pluginOptions: { multishop: { shopEnabled: true } },
          required: true,
        },
        bar: { type: 'text', pluginOptions: { multishop: { shopEnabled: true } } },
      };

      expect(addMultishopToFields(attributes)).toEqual(expected);
    });
  });

  describe('disableAttributesMultishop', () => {
    it('should remove the pluginOptions.multishop for all attributes', () => {
      const attributes = {
        foo: {
          type: 'text',
          pluginOptions: { pluginA: { ok: true }, multishop: { shopEnabled: true } },
          required: true,
        },
        bar: { type: 'text', pluginOptions: { multishop: { shopEnabled: true } } },
      };

      const expected = {
        foo: { type: 'text', required: true, pluginOptions: { pluginA: { ok: true } } },
        bar: { type: 'text', pluginOptions: {} },
      };

      expect(disableAttributesMultishop(attributes)).toEqual(expected);
    });
  });
});
