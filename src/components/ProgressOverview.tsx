import React from 'react';
import { usePlanStore } from '@/store/planStore';
import { PlanStatus } from '@/types';
import { TrendingUp, Target, CheckCircle, Clock } from 'lucide-react';
import { isToday, isThisWeek } from 'date-fns';

const ProgressOverview: React.FC = () => {
  const { plans } = usePlanStore();
  
  // 计算今日数据
  const todayPlans = plans.filter(plan => isToday(new Date(plan.createdAt)));
  const todayCompleted = todayPlans.filter(plan => plan.status === PlanStatus.COMPLETED).length;
  const todayProgress = todayPlans.length > 0 ? Math.round((todayCompleted / todayPlans.length) * 100) : 0;
  
  // 计算本周数据
  const weekPlans = plans.filter(plan => isThisWeek(new Date(plan.createdAt)));
  const weekCompleted = weekPlans.filter(plan => plan.status === PlanStatus.COMPLETED).length;
  const weekProgress = weekPlans.length > 0 ? Math.round((weekCompleted / weekPlans.length) * 100) : 0;
  
  // 计算总体数据
  const totalCompleted = plans.filter(plan => plan.status === PlanStatus.COMPLETED).length;
  const totalProgress = plans.length > 0 ? Math.round((totalCompleted / plans.length) * 100) : 0;
  
  const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({ 
    percentage, 
    size = 80, 
    strokeWidth = 8 
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* 背景圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* 进度圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3B82F6"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        {/* 中心文字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
    );
  };
  
  const StatCard: React.FC<{
    title: string;
    completed: number;
    total: number;
    progress: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, completed, total, progress, icon, color }) => {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${color}`}>
              {icon}
            </div>
            <h4 className="font-medium text-gray-900">{title}</h4>
          </div>
          <CircularProgress percentage={progress} size={60} strokeWidth={6} />
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{completed}</span> / {total} 已完成
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900 text-lg">进度概览</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="今日计划"
          completed={todayCompleted}
          total={todayPlans.length}
          progress={todayProgress}
          icon={<Clock className="w-5 h-5 text-white" />}
          color="bg-orange-500"
        />
        
        <StatCard
          title="本周计划"
          completed={weekCompleted}
          total={weekPlans.length}
          progress={weekProgress}
          icon={<Target className="w-5 h-5 text-white" />}
          color="bg-purple-500"
        />
        
        <StatCard
          title="总体进度"
          completed={totalCompleted}
          total={plans.length}
          progress={totalProgress}
          icon={<CheckCircle className="w-5 h-5 text-white" />}
          color="bg-green-500"
        />
      </div>
      
      {/* 快速统计 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{plans.length}</div>
            <div className="text-sm text-gray-600">总计划数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {plans.filter(plan => plan.status === PlanStatus.IN_PROGRESS).length}
            </div>
            <div className="text-sm text-gray-600">进行中</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {plans.filter(plan => plan.status === PlanStatus.OVERDUE).length}
            </div>
            <div className="text-sm text-gray-600">已逾期</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;