import { describe, it, expect, vi } from 'vitest';
import { Router } from '@site/integrations/content-admin/router';

describe('Router', () => {
  it('calls a matching route handler', async () => {
    const handler = vi.fn();
    const router = new Router();
    router.get('/foo', handler);
    await router.dispatch('GET', '/foo');
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not call a handler when method does not match', async () => {
    const handler = vi.fn();
    const router = new Router();
    router.get('/foo', handler);
    await router.dispatch('POST', '/foo');
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not call a handler when path does not match', async () => {
    const handler = vi.fn();
    const router = new Router();
    router.get('/foo', handler);
    await router.dispatch('GET', '/bar');
    expect(handler).not.toHaveBeenCalled();
  });

  it('runs middleware in registration order before the route', async () => {
    const order: string[] = [];
    const router = new Router();
    router.use(async (next) => {
      order.push('mw1');
      await next();
    });
    router.use(async (next) => {
      order.push('mw2');
      await next();
    });
    router.get('/x', async () => {
      order.push('route');
    });
    await router.dispatch('GET', '/x');
    expect(order).toEqual(['mw1', 'mw2', 'route']);
  });

  it('short-circuits when middleware does not call next()', async () => {
    const handler = vi.fn();
    const router = new Router();
    router.use(async (_next) => {
      /* intentionally skip next */
    });
    router.get('/x', handler);
    await router.dispatch('GET', '/x');
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports POST and PUT routes', async () => {
    const post = vi.fn();
    const put = vi.fn();
    const router = new Router();
    router.post('/items', post);
    router.put('/items', put);
    await router.dispatch('POST', '/items');
    await router.dispatch('PUT', '/items');
    expect(post).toHaveBeenCalledOnce();
    expect(put).toHaveBeenCalledOnce();
  });

  it('resolves silently when no route matches', async () => {
    const router = new Router();
    await expect(router.dispatch('GET', '/missing')).resolves.toBeUndefined();
  });
});
