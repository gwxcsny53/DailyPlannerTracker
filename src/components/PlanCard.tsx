import React from 'react';
import { Plan, PlanStatus, PlanType } from '@/types';
import { format } from 'date-fns';
import { CheckCircle, Clock, Calendar, Target, MoreHorizontal, AlertCircle } from 'lucide-react';
import { usePlanStore } from '@/store/planStore';

interface PlanCardProps {
  plan: Plan;
  onClick?: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onClick }) => {
  const { togglePlanStatus, updatePlanStatus } = usePlanStore();
  
  const getStatusColor = () => {
    switch (plan.status) {
      case PlanStatus.COMPLETED:
        return 'bg-green-50 border-green-200 text-green-800';
      case PlanStatus.IN_PROGRESS:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case PlanStatus.OVERDUE:
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };
  
  const getTypeColor = () => {
    switch (plan.type) {
      case PlanType.DAILY:
        return 'bg-blue-100 text-blue-800';
      case PlanType.WEEKLY:
        return 'bg-purple-100 text-purple-800';
      case PlanType.LONG_TERM:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTypeText = () => {
    switch (plan.type) {
      case PlanType.DAILY:
        return '每日';
      case PlanType.WEEKLY:
        return '每周';
      case PlanType.LONG_TERM:
        return '长期';
      default:
        return '未知';
    }
  };
  
  const getStatusText = () => {
    switch (plan.status) {
      case PlanStatus.COMPLETED:
        return '已完成';
      case PlanStatus.IN_PROGRESS:
        return '进行中';
      case PlanStatus.OVERDUE:
        return '已逾期';
      default:
        return '待开始';
    }
  };

  const getStatusIcon = () => {
    switch (plan.status) {
      case PlanStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case PlanStatus.IN_PROGRESS:
        return <Target className="w-4 h-4 text-blue-600" />;
      case PlanStatus.OVERDUE:
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const handleStatusToggle = () => {
    if (plan.status === PlanStatus.COMPLETED) {
      updatePlanStatus(plan.id, PlanStatus.PENDING);
    } else {
      updatePlanStatus(plan.id, PlanStatus.COMPLETED);
    }
  };
  
  const completedSubTasks = plan.subTasks.filter(task => task.isCompleted).length;
  const totalSubTasks = plan.subTasks.length;
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{plan.title}</h3>
          {plan.description && (
            <p className="text-gray-600 text-sm mb-2">{plan.description}</p>
          )}
        </div>
        <button
          onClick={handleStatusToggle}
          className={`ml-2 p-1 rounded-full transition-colors ${
            plan.status === PlanStatus.COMPLETED
              ? 'text-green-600 hover:bg-green-50'
              : 'text-gray-400 hover:bg-gray-50'
          }`}
        >
          <CheckCircle className="w-6 h-6" />
        </button>
      </div>
      
      {/* 标签 */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor()}`}>
          {getTypeText()}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {plan.isRepeating && (
          <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-50">
            重复
          </span>
        )}
      </div>
      
      {/* 进度条 */}
      {totalSubTasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>进度</span>
            <span>{completedSubTasks}/{totalSubTasks}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${plan.progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* 底部信息 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(plan.endDate), 'MM/dd')}</span>
          </div>
          {totalSubTasks > 0 && (
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{totalSubTasks}项任务</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{format(new Date(plan.updatedAt), 'HH:mm')}</span>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;