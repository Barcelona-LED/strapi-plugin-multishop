import shopPermissionMiddleware from '../shopPermissionMiddleware';

describe('shopPermissionMiddleware', () => {
  it('does not modify the action when the type is not "ContentManager/RBACManager/SET_PERMISSIONS"', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'UNKNOWN_TYPE',
    };

    const nextAction = shopPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toBe(action);
  });

  it('does not modify the action when it the __meta__ key is not set', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: undefined,
    };

    const nextAction = shopPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toBe(action);
  });

  it('does not modify the action when it the __meta__.containerName is not "listView"', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: { containerName: undefined },
    };

    const nextAction = shopPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toBe(action);
  });

  it('does not modify the action when it the __meta__.plugins is not set', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: { containerName: 'listView' },
    };

    const nextAction = shopPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toBe(action);
  });

  it('does not modify the action when it the __meta__.plugins.multishop.shop is not set', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: {
        containerName: 'listView',
        plugins: {},
      },
    };

    const nextAction = shopPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toBe(action);
  });

  it('creates an empty permissions object from an empty array', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: {
        containerName: 'listView',
        plugins: {
          multishop: {
            shop: 'en',
          },
        },
      },
      permissions: {},
    };

    const nextAction = shopPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toEqual({
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: { containerName: 'listView', plugins: { multishop: { shop: 'en' } } },
      permissions: {},
    });
  });

  it('creates a valid permissions object from a filled array', () => {
    const nextFn = jest.fn(x => x);
    const action = {
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: {
        containerName: 'listView',
        plugins: {
          multishop: {
            shop: 'en',
          },
        },
      },
      permissions: {
        'plugins::content-manager.explorer.create': [
          {
            id: 459,
            action: 'plugins::content-manager.explorer.create',
            subject: 'application::article.article',
            properties: {
              fields: ['Name'],
              shops: ['en'],
            },
            conditions: [],
          },
          {
            id: 459,
            action: 'plugins::content-manager.explorer.create',
            subject: 'application::article.article',
            properties: {
              fields: ['test'],
              shops: ['it'],
            },
            conditions: [],
          },
        ],
      },
    };

    const nextAction = shopPermissionMiddleware()()(nextFn)(action);

    expect(nextAction).toEqual({
      type: 'ContentManager/RBACManager/SET_PERMISSIONS',
      __meta__: { containerName: 'listView', plugins: { multishop: { shop: 'en' } } },
      permissions: {
        'plugins::content-manager.explorer.create': [
          {
            id: 459,
            action: 'plugins::content-manager.explorer.create',
            subject: 'application::article.article',
            properties: {
              fields: ['Name'],
              shops: ['en'],
            },

            conditions: [],
          },
        ],
      },
    });
  });
});
