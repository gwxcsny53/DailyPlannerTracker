import React from 'react';
import { PlanStatus, PlanType, FilterOptions } from '@/types';
import { usePlanStore } from '@/store/planStore';
import { Filter, Calendar, CheckCircle, Clock, Target, RotateCcw } from 'lucide-react';

const FilterBar: React.FC = () => {
  const { filterOptions, setFilter } = usePlanStore();
  
  const statusOptions = [
    { value: 'all', label: '全部状态', icon: Filter },
    { value: PlanStatus.PENDING, label: '待完成', icon: Clock },
    { value: PlanStatus.IN_PROGRESS, label: '进行中', icon: Target },
    { value: PlanStatus.COMPLETED, label: '已完成', icon: CheckCircle },
    { value: PlanStatus.OVERDUE, label: '已逾期', icon: Clock }
  ];
  
  const typeOptions = [
    { value: 'all', label: '全部类型', icon: Filter },
    { value: PlanType.DAILY, label: '每日计划', icon: Calendar },
    { value: PlanType.WEEKLY, label: '每周计划', icon: Calendar },
    { value: PlanType.LONG_TERM, label: '长期计划', icon: Calendar }
  ];
  
  const timeRangeOptions = [
    { value: 'all', label: '全部时间', icon: Calendar },
    { value: 'today', label: '今天', icon: Calendar },
    { value: 'week', label: '本周', icon: Calendar },
    { value: 'month', label: '本月', icon: Calendar }
  ];
  
  const FilterButton: React.FC<{
    options: Array<{ value: string; label: string; icon: any }>;
    currentValue: string;
    onChange: (value: string) => void;
    label: string;
  }> = ({ options, currentValue, onChange, label }) => {
    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex flex-wrap gap-1">
          {options.map((option) => {
            const Icon = option.icon;
            const isActive = currentValue === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">筛选条件</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterButton
          label="状态"
          options={statusOptions}
          currentValue={filterOptions.status}
          onChange={(value) => setFilter({ status: value as PlanStatus | 'all' })}
        />
        
        <FilterButton
          label="类型"
          options={typeOptions}
          currentValue={filterOptions.type}
          onChange={(value) => setFilter({ type: value as PlanType | 'all' })}
        />
        
        <FilterButton
          label="时间范围"
          options={timeRangeOptions}
          currentValue={filterOptions.timeRange}
          onChange={(value) => setFilter({ timeRange: value as FilterOptions['timeRange'] })}
        />
      </div>
      
      {/* 重置按钮 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => setFilter({ status: 'all', type: 'all', timeRange: 'all' })}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          重置筛选条件
        </button>
      </div>
    </div>
  );
};

export default FilterBar;