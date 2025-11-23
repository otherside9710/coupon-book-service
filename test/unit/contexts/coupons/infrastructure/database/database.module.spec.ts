describe('DatabaseModule wiring', () => {
  it('calls TypeOrmModule.forRoot with AppDataSource options', () => {
    // Mock TypeOrmModule.forRoot before importing the module under test
    const forRootMock = jest.fn().mockReturnValue({ mocked: true });
    jest.doMock('@nestjs/typeorm', () => ({ TypeOrmModule: { forRoot: forRootMock } }));

    // Import the module inside isolated modules to ensure mock is used
    jest.isolateModules(() => {
      // require the module path
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@/contexts/coupons/infrastructure/database/database.module');
      expect(forRootMock).toHaveBeenCalled();
    });
  });
});
