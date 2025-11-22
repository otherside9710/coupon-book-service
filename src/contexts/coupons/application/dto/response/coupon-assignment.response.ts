export class CouponAssignmentResponse {
  code: string;
  couponBookId: string;
  userId: string;
  status: string;
  assignedAt?: Date;

  static fromDomain(codeEntity: any, couponBook: any, userId: string) {
    const resp = new CouponAssignmentResponse();
    resp.code = codeEntity.code;
    resp.couponBookId = couponBook.id;
    resp.userId = userId;
    resp.status = codeEntity.status;
    resp.assignedAt = codeEntity.assignedAt ? new Date(codeEntity.assignedAt) : new Date();
    return resp;
  }
}
