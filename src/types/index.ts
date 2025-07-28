// 计划类型枚举
export enum PlanType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  LONG_TERM = 'long_term'
}

// 计划状态枚举
export enum PlanStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  OVERDUE = 'overdue'
}

// 子任务接口
export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
  completedAt?: Date;
}

// 计划接口
export interface Plan {
  id: string;
  title: string;
  description?: string;
  type: PlanType;
  status: PlanStatus;
  startDate: Date;
  endDate: Date;
  isRepeating: boolean;
  repeatInterval?: number;
  estimatedDuration?: number; // 分钟数
  subTasks: SubTask[];
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// 成就接口
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
}

// 统计数据接口
export interface Statistics {
  totalPlans: number;
  completedPlans: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  dailyCompletions: { date: string; count: number }[];
  weeklyCompletions: { week: string; count: number }[];
  monthlyCompletions: { month: string; count: number }[];
}

// 筛选选项接口
export interface FilterOptions {
  status: PlanStatus | 'all';
  type: PlanType | 'all';
  timeRange: 'today' | 'week' | 'month' | 'all';
}

// 计划模板接口
export interface PlanTemplate {
  id: string;
  title: string;
  description: string;
  type: PlanType;
  defaultDuration: number; // 分钟数
  subTasks?: string[];
}