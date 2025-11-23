import { HealthController } from '@/apps/coupons/http/controllers/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('returns status ok', () => {
    expect(controller.health()).toEqual({ status: 'ok' });
  });
});
