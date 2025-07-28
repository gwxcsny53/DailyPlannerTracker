import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanStore } from '@/store/planStore';
import { PlanStatus, PlanType } from '@/types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isWithinInterval } from 'date-fns';
import { ArrowLeft, TrendingUp, BarChart3, PieChart, Download, Calendar } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type TimeRange = 'week' | 'month' | 'year';

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { plans } = usePlanStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  
  // 计算时间范围
  const getTimeInterval = () => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31)
        };
    }
  };
  
  const timeInterval = getTimeInterval();
  
  // 筛选时间范围内的计划
  const filteredPlans = plans.filter(plan => 
    isWithinInterval(new Date(plan.createdAt), timeInterval)
  );
  
  // 每日完成数据
  const dailyCompletionData = useMemo(() => {
    const days = eachDayOfInterval(timeInterval);
    const data = days.map(day => {
      const dayPlans = plans.filter(plan => {
        const planDate = new Date(plan.completedAt || plan.createdAt);
        return format(planDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && 
               plan.status === PlanStatus.COMPLETED;
      });
      return {
        date: format(day, 'MM-dd'),
        count: dayPlans.length
      };
    });
    
    return {
      labels: data.map(d => d.date),
      datasets: [
        {
          label: '完成数量',
          data: data.map(d => d.count),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2
        }
      ]
    };
  }, [plans, timeInterval]);
  
  // 完成率趋势数据
  const completionTrendData = useMemo(() => {
    const intervals = timeRange === 'week' 
      ? eachDayOfInterval(timeInterval)
      : timeRange === 'month'
      ? eachWeekOfInterval(timeInterval)
      : eachMonthOfInterval(timeInterval);
    
    const data = intervals.map(interval => {
      const intervalPlans = plans.filter(plan => {
        const planDate = new Date(plan.createdAt);
        if (timeRange === 'week') {
          return format(planDate, 'yyyy-MM-dd') === format(interval, 'yyyy-MM-dd');
        } else if (timeRange === 'month') {
          return isWithinInterval(planDate, {
            start: startOfWeek(interval),
            end: endOfWeek(interval)
          });
        } else {
          return format(planDate, 'yyyy-MM') === format(interval, 'yyyy-MM');
        }
      });
      
      const completedPlans = intervalPlans.filter(plan => plan.status === PlanStatus.COMPLETED);
      const rate = intervalPlans.length > 0 ? Math.round((completedPlans.length / intervalPlans.length) * 100) : 0;
      
      return {
        label: timeRange === 'week' 
          ? format(interval, 'MM-dd')
          : timeRange === 'month'
          ? `第${Math.ceil((interval.getDate()) / 7)}周`
          : format(interval, 'MM月'),
        rate
      };
    });
    
    return {
      labels: data.map(d => d.label),
      datasets: [
        {
          label: '完成率 (%)',
          data: data.map(d => d.rate),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [plans, timeInterval, timeRange]);
  
  // 计划类型分布数据
  const planTypeData = useMemo(() => {
    const typeCounts = {
      [PlanType.DAILY]: 0,
      [PlanType.WEEKLY]: 0,
      [PlanType.LONG_TERM]: 0
    };
    
    filteredPlans.forEach(plan => {
      typeCounts[plan.type]++;
    });
    
    return {
      labels: ['每日计划', '每周计划', '长期计划'],
      datasets: [
        {
          data: [typeCounts[PlanType.DAILY], typeCounts[PlanType.WEEKLY], typeCounts[PlanType.LONG_TERM]],
          backgroundColor: [
            'rgba(249, 115, 22, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(99, 102, 241, 0.8)'
          ],
          borderColor: [
            'rgba(249, 115, 22, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(99, 102, 241, 1)'
          ],
          borderWidth: 2
        }
      ]
    };
  }, [filteredPlans]);
  
  // 统计数据
  const stats = useMemo(() => {
    const completed = filteredPlans.filter(plan => plan.status === PlanStatus.COMPLETED).length;
    const inProgress = filteredPlans.filter(plan => plan.status === PlanStatus.IN_PROGRESS).length;
    const overdue = filteredPlans.filter(plan => plan.status === PlanStatus.OVERDUE).length;
    const pending = filteredPlans.filter(plan => plan.status === PlanStatus.PENDING).length;
    
    return {
      total: filteredPlans.length,
      completed,
      inProgress,
      overdue,
      pending,
      completionRate: filteredPlans.length > 0 ? Math.round((completed / filteredPlans.length) * 100) : 0
    };
  }, [filteredPlans]);
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };
  
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };
  
  const handleExport = () => {
    // 简单的导出功能，实际项目中可以使用更专业的库
    const data = {
      timeRange,
      stats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">统计分析</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 时间范围选择 */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range === 'week' ? '本周' : range === 'month' ? '本月' : '本年'}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>导出</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">总计划数</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">进行中</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">已逾期</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
            <div className="text-sm text-gray-600">完成率</div>
          </div>
        </div>
        
        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 每日完成数柱状图 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">每日完成数</h3>
            </div>
            <Bar data={dailyCompletionData} options={chartOptions} />
          </div>
          
          {/* 完成率趋势折线图 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">完成率趋势</h3>
            </div>
            <Line data={completionTrendData} options={lineChartOptions} />
          </div>
          
          {/* 计划类型分布饼图 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">计划类型分布</h3>
            </div>
            <div className="max-w-sm mx-auto">
              <Pie data={planTypeData} options={pieChartOptions} />
            </div>
          </div>
          
          {/* 详细统计 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">详细统计</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">平均每日完成</span>
                <span className="font-medium">
                  {timeRange === 'week' ? Math.round(stats.completed / 7 * 10) / 10 : 
                   timeRange === 'month' ? Math.round(stats.completed / 30 * 10) / 10 :
                   Math.round(stats.completed / 365 * 10) / 10} 个
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">最高单日完成</span>
                <span className="font-medium">
                  {Math.max(...dailyCompletionData.datasets[0].data)} 个
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">活跃天数</span>
                <span className="font-medium">
                  {dailyCompletionData.datasets[0].data.filter(count => count > 0).length} 天
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-2">状态分布</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">已完成</span>
                    </div>
                    <span className="text-sm font-medium">{stats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">进行中</span>
                    </div>
                    <span className="text-sm font-medium">{stats.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">待开始</span>
                    </div>
                    <span className="text-sm font-medium">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">已逾期</span>
                    </div>
                    <span className="text-sm font-medium">{stats.overdue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;