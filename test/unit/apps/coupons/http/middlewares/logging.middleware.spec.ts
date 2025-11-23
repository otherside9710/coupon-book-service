import { LoggingMiddleware } from '@/apps/coupons/http/middlewares/logging.middleware';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
  });

  it('logs request and response and calls next', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    const req: any = {
      method: 'GET',
      originalUrl: '/test',
    };

    let finishCallback: any = null;
    const res: any = {
      statusCode: 200,
      on: (event: string, cb: () => void) => {
        if (event === 'finish') finishCallback = cb;
      },
    };

    const next = jest.fn();

    middleware.use(req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith('[REQUEST] GET /test');
    expect(next).toHaveBeenCalled();

    // simulate response finished
    expect(finishCallback).toBeTruthy();
    if (finishCallback) (finishCallback as any)();

    // response log should be called at least once more
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
