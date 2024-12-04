// types/Project.ts
export interface Project {
    id: number;
    projectName: string;
    startDate: Date;
    endDate: Date;
    studyAmount?: number;
    status?: string;
    description?: string;
    createdAt?: Date;
    createdById?: number;
    createdBy?: {
      id: number;
      username: string;
      email?: string;
    };
    realExpense?: number;
  }
  