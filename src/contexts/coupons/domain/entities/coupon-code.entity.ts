export class CouponCode {
  id: string;
  couponBookId: string;
  code: string;
  status: string;
  assignedToUserId?: string | null;
  assignedAt?: Date | null;
  lockedBy?: string | null;
  lockedAt?: Date | null;
  lockExpiresAt?: Date | null;
  redeemedAt?: Date | null;
  redeemedByUserId?: string | null;

  constructor(partial: Partial<CouponCode>) {
    Object.assign(this, partial);
  }

  assignTo(userId: string) {
    this.status = 'ASSIGNED';
    this.assignedToUserId = userId;
    this.assignedAt = new Date();
  }

  isAssignedTo(userId: string): boolean {
    return this.assignedToUserId === userId;
  }
}
