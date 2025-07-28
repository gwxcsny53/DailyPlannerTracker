import React, { useState } from 'react';
import { usePlanStore } from '@/store/planStore';
import PlanCard from '@/components/PlanCard';
import FilterBar from '@/components/FilterBar';
import ProgressOverview from '@/components/ProgressOverview';
import QuickAddButton from '@/components/QuickAddButton';
import { Calendar, Target, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { getFilteredPlans } = usePlanStore();
  const navigate = useNavigate();
  const filteredPlans = getFilteredPlans();
  
  const handlePlanClick = (planId: string) => {
    navigate(`/plan/${planId}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">每日计划打卡</h1>
            </div>
            
            <nav className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/analytics')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span>统计分析</span>
              </button>
              <button 
                onClick={() => navigate('/achievements')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>成就中心</span>
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 进度概览 */}
        <ProgressOverview />
        
        {/* 筛选器 */}
        <FilterBar />
        
        {/* 计划列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900 text-lg">我的计划</h2>
              <span className="text-sm text-gray-500">({filteredPlans.length})</span>
            </div>
          </div>
          
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无计划</h3>
              <p className="text-gray-600 mb-4">点击右下角的 + 按钮开始创建您的第一个计划</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  onClick={() => handlePlanClick(plan.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* 快速添加按钮 */}
      <QuickAddButton />
    </div>
  );
}