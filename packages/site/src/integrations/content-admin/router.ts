type Next = () => Promise<void>;
export type Middleware = (next: Next) => Promise<void>;
export type RouteHandler = () => Promise<void>;

/**
 * Minimal async middleware + route-dispatch helper.
 *
 * Middleware runs in registration order; each must either call `next()` to
 * pass control downstream or respond and return without calling it.
 * After all middleware, the first exact `METHOD /path` match is called.
 */
export class Router {
  private readonly middlewares: Middleware[] = [];
  private readonly routes = new Map<string, RouteHandler>();

  use(fn: Middleware): this {
    this.middlewares.push(fn);
    return this;
  }

  get(path: string, fn: RouteHandler): this {
    return this.add('GET', path, fn);
  }
  post(path: string, fn: RouteHandler): this {
    return this.add('POST', path, fn);
  }
  put(path: string, fn: RouteHandler): this {
    return this.add('PUT', path, fn);
  }

  private add(method: string, path: string, fn: RouteHandler): this {
    this.routes.set(`${method} ${path}`, fn);
    return this;
  }

  async dispatch(method: string, path: string): Promise<void> {
    let i = 0;
    const next: Next = async () => {
      if (i < this.middlewares.length) {
        await this.middlewares[i++](next);
      } else {
        await this.routes.get(`${method} ${path}`)?.();
      }
    };
    await next();
  }
}
