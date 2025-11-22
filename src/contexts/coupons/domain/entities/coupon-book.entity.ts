export class CouponBook {
  id: string;
  name?: string;
  availableCodes?: number;
  totalCodes?: number;
  maxCodesPerUser?: number;
  allowMultipleRedemptionsPerUser?: boolean;
  validFrom?: Date | null;
  validUntil?: Date | null;

  constructor(partial: Partial<CouponBook>) {
    Object.assign(this, partial);
  }

  isValid(): boolean {
    const now = new Date();
    if (this.validFrom && now < this.validFrom) return false;
    if (this.validUntil && now > this.validUntil) return false;
    return true;
  }

  hasMaxCodesPerUser(): boolean {
    return typeof this.maxCodesPerUser === 'number' && this.maxCodesPerUser > 0;
  }

  allowsMultipleRedemptions(): boolean {
    return !!this.allowMultipleRedemptionsPerUser;
  }

  decrementAvailableCodes() {
    if (typeof this.availableCodes === 'number') this.availableCodes = Math.max(0, this.availableCodes - 1);
  }
}
