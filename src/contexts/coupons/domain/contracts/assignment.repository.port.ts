export interface IAssignmentRepository {
  save(assignment: any): Promise<void>;
  countByUserAndBook(userId: string, bookId: string): Promise<number>;
}
