import React, { useState } from 'react';
import { Plus, X, Sparkles, Wand2 } from 'lucide-react';
import { usePlanStore } from '@/store/planStore';
import { parseNaturalLanguage } from '@/utils/nlp';
import { Plan, PlanStatus, PlanType } from '@/types';
import { toast } from 'sonner';

const QuickAddButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isNLPMode, setIsNLPMode] = useState(true);
  const { addPlan } = usePlanStore();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      toast.error('请输入计划内容');
      return;
    }
    
    try {
      if (isNLPMode) {
        // 使用自然语言解析
        const parsed = parseNaturalLanguage(input);
        
        addPlan({
          title: parsed.title,
          type: parsed.type,
          status: PlanStatus.PENDING,
          startDate: parsed.startDate ? new Date(parsed.startDate) : new Date(),
          endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
          isRepeating: parsed.isRepeating,
          repeatInterval: parsed.repeatInterval,
          subTasks: [],
          progress: 0
        });
        
        toast.success(`已创建${getTypeLabel(parsed.type)}计划: ${parsed.title}`);
      } else {
        // 简单模式
        const now = new Date();
        addPlan({
          title: input,
          type: PlanType.DAILY,
          status: PlanStatus.PENDING,
          startDate: now,
          endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          isRepeating: false,
          subTasks: [],
          progress: 0
        });
        
        toast.success(`已创建计划: ${input}`);
      }
      
      setInput('');
      setIsOpen(false);
    } catch (error) {
      toast.error('创建计划失败，请重试');
    }
  };
  
  const getTypeLabel = (type: PlanType) => {
    switch (type) {
      case PlanType.DAILY:
        return '每日';
      case PlanType.WEEKLY:
        return '每周';
      case PlanType.LONG_TERM:
        return '长期';
      default:
        return '';
    }
  };
  
  const examples = [
    '今天完成UI设计',
    '周五前写完报告',
    '本周学习React',
    '每天运动30分钟'
  ];
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">快速添加计划</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 内容 */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* 模式切换 */}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setIsNLPMode(!isNLPMode)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isNLPMode
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              智能解析
            </button>
            <span className="text-sm text-gray-500">
              {isNLPMode ? '自动识别时间和类型' : '简单文本输入'}
            </span>
          </div>
          
          {/* 输入框 */}
          <div className="mb-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isNLPMode ? '例如: 今天完成UI设计, 周五前写完报告...' : '输入计划标题...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              autoFocus
            />
          </div>
          
          {/* 示例 */}
          {isNLPMode && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">示例:</p>
              <div className="flex flex-wrap gap-1">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setInput(example)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 按钮 */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              创建计划
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddButton;