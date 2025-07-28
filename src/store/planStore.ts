import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Plan, PlanType, PlanStatus, SubTask, FilterOptions, Statistics, Achievement } from '@/types';
import { format, isToday, isThisWeek, isThisMonth, startOfDay, endOfDay } from 'date-fns';

interface PlanStore {
  // 状态
  plans: Plan[];
  filterOptions: FilterOptions;
  achievements: Achievement[];
  
  // 计划操作
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  togglePlanStatus: (id: string) => void;
  updatePlanStatus: (id: string, status: PlanStatus) => void;
  
  // 子任务操作
  addSubTask: (planId: string, title: string) => void;
  toggleSubTask: (planId: string, subTaskId: string) => void;
  deleteSubTask: (planId: string, subTaskId: string) => void;
  
  // 筛选操作
  setFilter: (filter: Partial<FilterOptions>) => void;
  getFilteredPlans: () => Plan[];
  
  // 统计数据
  getStatistics: () => Statistics;
  
  // 成就系统
  checkAndUnlockAchievements: () => void;
  
  // 工具方法
  calculateProgress: (plan: Plan) => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultAchievements: Achievement[] = [
  {
    id: 'first_plan',
    title: '初次尝试',
    description: '创建第一个计划',
    icon: '🎯',
    isUnlocked: false
  },
  {
    id: 'streak_7',
    title: '坚持一周',
    description: '连续打卡7天',
    icon: '🔥',
    isUnlocked: false
  },
  {
    id: 'completion_90',
    title: '完美主义者',
    description: '本月完成率超过90%',
    icon: '⭐',
    isUnlocked: false
  },
  {
    id: 'total_50',
    title: '计划达人',
    description: '累计完成50个计划',
    icon: '🏆',
    isUnlocked: false
  }
];

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plans: [],
      filterOptions: {
        status: 'all',
        type: 'all',
        timeRange: 'all'
      },
      achievements: defaultAchievements,
      
      addPlan: (planData) => {
        const newPlan: Plan = {
          ...planData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          progress: 0
        };
        
        set((state) => ({
          plans: [...state.plans, newPlan]
        }));
        
        get().checkAndUnlockAchievements();
      },
      
      updatePlan: (id, updates) => {
        set((state) => ({
          plans: state.plans.map(plan => 
            plan.id === id 
              ? { ...plan, ...updates, updatedAt: new Date() }
              : plan
          )
        }));
      },
      
      deletePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter(plan => plan.id !== id)
        }));
      },
      
      togglePlanStatus: (id) => {
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === id) {
              const newStatus = plan.status === PlanStatus.COMPLETED 
                ? PlanStatus.PENDING 
                : PlanStatus.COMPLETED;
              
              return {
                ...plan,
                status: newStatus,
                completedAt: newStatus === PlanStatus.COMPLETED ? new Date() : undefined,
                updatedAt: new Date()
              };
            }
            return plan;
          })
        }));
        
        get().checkAndUnlockAchievements();
      },
      
      updatePlanStatus: (id, status) => {
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === id) {
              return {
                ...plan,
                status,
                completedAt: status === PlanStatus.COMPLETED ? new Date() : undefined,
                updatedAt: new Date()
              };
            }
            return plan;
          })
        }));
        
        get().checkAndUnlockAchievements();
      },
      
      addSubTask: (planId, title) => {
        const newSubTask: SubTask = {
          id: generateId(),
          title,
          isCompleted: false,
          createdAt: new Date()
        };
        
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === planId) {
              const updatedPlan = {
                ...plan,
                subTasks: [...plan.subTasks, newSubTask],
                updatedAt: new Date()
              };
              updatedPlan.progress = get().calculateProgress(updatedPlan);
              return updatedPlan;
            }
            return plan;
          })
        }));
      },
      
      toggleSubTask: (planId, subTaskId) => {
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === planId) {
              const updatedPlan = {
                ...plan,
                subTasks: plan.subTasks.map(subTask => 
                  subTask.id === subTaskId 
                    ? { 
                        ...subTask, 
                        isCompleted: !subTask.isCompleted,
                        completedAt: !subTask.isCompleted ? new Date() : undefined
                      }
                    : subTask
                ),
                updatedAt: new Date()
              };
              updatedPlan.progress = get().calculateProgress(updatedPlan);
              return updatedPlan;
            }
            return plan;
          })
        }));
      },
      
      deleteSubTask: (planId, subTaskId) => {
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === planId) {
              const updatedPlan = {
                ...plan,
                subTasks: plan.subTasks.filter(subTask => subTask.id !== subTaskId),
                updatedAt: new Date()
              };
              updatedPlan.progress = get().calculateProgress(updatedPlan);
              return updatedPlan;
            }
            return plan;
          })
        }));
      },
      
      setFilter: (filter) => {
        set((state) => ({
          filterOptions: { ...state.filterOptions, ...filter }
        }));
      },
      
      getFilteredPlans: () => {
        const { plans, filterOptions } = get();
        
        return plans.filter(plan => {
          // 状态筛选
          if (filterOptions.status !== 'all' && plan.status !== filterOptions.status) {
            return false;
          }
          
          // 类型筛选
          if (filterOptions.type !== 'all' && plan.type !== filterOptions.type) {
            return false;
          }
          
          // 时间筛选
          if (filterOptions.timeRange !== 'all') {
            const planDate = new Date(plan.createdAt);
            switch (filterOptions.timeRange) {
              case 'today':
                return isToday(planDate);
              case 'week':
                return isThisWeek(planDate);
              case 'month':
                return isThisMonth(planDate);
            }
          }
          
          return true;
        });
      },
      
      calculateProgress: (plan) => {
        if (plan.subTasks.length === 0) {
          return plan.status === PlanStatus.COMPLETED ? 100 : 0;
        }
        
        const completedSubTasks = plan.subTasks.filter(subTask => subTask.isCompleted).length;
        return Math.round((completedSubTasks / plan.subTasks.length) * 100);
      },
      
      getStatistics: () => {
        const { plans } = get();
        const completedPlans = plans.filter(plan => plan.status === PlanStatus.COMPLETED);
        
        // 计算连续打卡天数
        const sortedCompletedPlans = completedPlans
          .filter(plan => plan.completedAt)
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
        
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        // 简化的连续打卡计算
        for (let i = 0; i < sortedCompletedPlans.length; i++) {
          const planDate = new Date(sortedCompletedPlans[i].completedAt!);
          if (i === 0 && isToday(planDate)) {
            currentStreak = 1;
            tempStreak = 1;
          } else if (i > 0) {
            const prevDate = new Date(sortedCompletedPlans[i - 1].completedAt!);
            const dayDiff = Math.abs(planDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (dayDiff <= 1) {
              tempStreak++;
              if (i === 0 || isToday(planDate)) {
                currentStreak = tempStreak;
              }
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
        
        return {
          totalPlans: plans.length,
          completedPlans: completedPlans.length,
          completionRate: plans.length > 0 ? Math.round((completedPlans.length / plans.length) * 100) : 0,
          currentStreak,
          longestStreak,
          dailyCompletions: [],
          weeklyCompletions: [],
          monthlyCompletions: []
        };
      },
      
      checkAndUnlockAchievements: () => {
        const { plans, achievements } = get();
        const stats = get().getStatistics();
        
        set((state) => ({
          achievements: state.achievements.map(achievement => {
            if (achievement.isUnlocked) return achievement;
            
            let shouldUnlock = false;
            
            switch (achievement.id) {
              case 'first_plan':
                shouldUnlock = plans.length >= 1;
                break;
              case 'streak_7':
                shouldUnlock = stats.currentStreak >= 7;
                break;
              case 'completion_90':
                shouldUnlock = stats.completionRate >= 90 && stats.totalPlans >= 10;
                break;
              case 'total_50':
                shouldUnlock = stats.completedPlans >= 50;
                break;
            }
            
            if (shouldUnlock) {
              return {
                ...achievement,
                isUnlocked: true,
                unlockedAt: new Date()
              };
            }
            
            return achievement;
          })
        }));
      }
    }),
    {
      name: 'daily-planner-storage',
      version: 1
    }
  )
);