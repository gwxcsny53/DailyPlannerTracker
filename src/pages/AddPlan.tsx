import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlanStore } from '@/store/planStore';
import { planTemplates } from '@/data/templates';
import { parseNaturalLanguage } from '@/utils/nlp';
import { PlanType, Plan, PlanStatus } from '@/types';
import { ArrowLeft, Plus, Trash2, Calendar, Clock, Repeat, Lightbulb, Wand2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AddPlan: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { plans, addPlan, updatePlan } = usePlanStore();
  
  const isEditing = Boolean(id);
  const existingPlan = isEditing ? plans.find(p => p.id === id) : null;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: PlanType.DAILY,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    isRepeating: false,
    repeatInterval: 1,
    estimatedDuration: 30,
    subTasks: [] as string[]
  });
  
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [newSubTask, setNewSubTask] = useState('');
  
  // 编辑模式下初始化表单数据
  useEffect(() => {
    if (existingPlan) {
      setFormData({
        title: existingPlan.title,
        description: existingPlan.description || '',
        type: existingPlan.type,
        startDate: format(new Date(existingPlan.startDate), 'yyyy-MM-dd'),
        endDate: existingPlan.endDate ? format(new Date(existingPlan.endDate), 'yyyy-MM-dd') : '',
        isRepeating: existingPlan.isRepeating,
        repeatInterval: existingPlan.repeatInterval || 1,
        estimatedDuration: existingPlan.estimatedDuration || 30,
        subTasks: existingPlan.subTasks?.map(st => st.title) || []
      });
    }
  }, [existingPlan]);
  
  const handleNaturalLanguageParse = () => {
    if (!naturalLanguageInput.trim()) {
      toast.error('请输入计划描述');
      return;
    }
    
    const parsed = parseNaturalLanguage(naturalLanguageInput);
    setFormData(prev => ({
      ...prev,
      title: parsed.title,
      type: parsed.type,
      startDate: parsed.startDate ? format(new Date(parsed.startDate), 'yyyy-MM-dd') : prev.startDate,
      endDate: parsed.endDate ? format(new Date(parsed.endDate), 'yyyy-MM-dd') : prev.endDate,
      isRepeating: parsed.isRepeating,
      repeatInterval: parsed.repeatInterval || prev.repeatInterval
    }));
    
    toast.success('已解析计划信息！');
  };
  
  const handleTemplateSelect = (template: typeof planTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      type: template.type,
      estimatedDuration: template.defaultDuration,
      subTasks: template.subTasks || []
    }));
    setShowTemplates(false);
    toast.success(`已应用模板：${template.title}`);
  };
  
  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      subTasks: [...prev.subTasks, newSubTask.trim()]
    }));
    setNewSubTask('');
  };
  
  const handleRemoveSubTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subTasks: prev.subTasks.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('请输入计划标题');
      return;
    }
    
    const planData: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      status: PlanStatus.PENDING,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      isRepeating: formData.isRepeating,
      repeatInterval: formData.isRepeating ? formData.repeatInterval : undefined,
      estimatedDuration: formData.estimatedDuration,
      progress: 0,
      subTasks: formData.subTasks.map(title => ({
        id: Date.now().toString() + Math.random(),
        title,
        isCompleted: false,
        createdAt: new Date()
      }))
    };
    
    if (isEditing && existingPlan) {
      updatePlan(existingPlan.id, planData);
      toast.success('计划已更新！');
    } else {
      addPlan(planData);
      toast.success('计划已创建！');
    }
    
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Plus className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? '编辑计划' : '创建新计划'}
            </h1>
          </div>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 自然语言输入 */}
          {!isEditing && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">智能解析</h3>
                <span className="text-sm text-gray-500">（可选）</span>
              </div>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  placeholder="例如：每天早上7点跑步30分钟，持续一个月"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleNaturalLanguageParse}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  解析
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                💡 试试用自然语言描述你的计划，系统会自动解析时间、类型等信息
              </p>
            </div>
          )}
          
          {/* 模板选择 */}
          {!isEditing && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">快速模板</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showTemplates ? '收起' : '展开'}
                </button>
              </div>
              
              {showTemplates && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {planTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900 mb-1">{template.title}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                      <div className="text-xs text-blue-600 mt-2">
                        {template.type === 'daily' ? '每日' : template.type === 'weekly' ? '每周' : '长期'} · 
                        {template.defaultDuration}分钟
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* 基本信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">基本信息</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  计划标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入计划标题"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  计划描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="详细描述你的计划..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  计划类型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PlanType }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={PlanType.DAILY}>每日计划</option>
                  <option value={PlanType.WEEKLY}>每周计划</option>
                  <option value={PlanType.LONG_TERM}>长期计划</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预估时长（分钟）
                </label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 30 }))}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          {/* 时间设置 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">时间设置</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  开始日期
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  结束日期（可选）
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  min={formData.startDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* 重复设置 */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="isRepeating"
                  checked={formData.isRepeating}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRepeating: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isRepeating" className="text-sm font-medium text-gray-700">
                  重复执行
                </label>
              </div>
              
              {formData.isRepeating && (
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">每</span>
                  <input
                    type="number"
                    value={formData.repeatInterval}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeatInterval: parseInt(e.target.value) || 1 }))}
                    min="1"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-600">
                    {formData.type === PlanType.DAILY ? '天' : formData.type === PlanType.WEEKLY ? '周' : '月'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* 子任务 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">子任务</h3>
              <span className="text-sm text-gray-500">（可选）</span>
            </div>
            
            {/* 添加子任务 */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubTask())}
                placeholder="输入子任务内容"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddSubTask}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* 子任务列表 */}
            {formData.subTasks.length > 0 && (
              <div className="space-y-2">
                {formData.subTasks.map((subTask, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="flex-1 text-sm text-gray-700">{subTask}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubTask(index)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 提交按钮 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? '更新计划' : '创建计划'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddPlan;