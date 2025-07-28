import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlanStore } from '@/store/planStore';
import { PlanStatus, PlanType } from '@/types';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Edit3, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  Target,
  CheckCircle,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plans, updatePlan, deletePlan, addSubTask, toggleSubTask, deleteSubTask } = usePlanStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    type: PlanType.DAILY,
    endDate: ''
  });
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [showAddSubTask, setShowAddSubTask] = useState(false);
  
  const plan = plans.find(p => p.id === id);
  
  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">计划不存在</h2>
          <p className="text-gray-600 mb-4">您要查看的计划可能已被删除</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }
  
  const handleEdit = () => {
    setEditForm({
      title: plan.title,
      description: plan.description || '',
      type: plan.type,
      endDate: format(new Date(plan.endDate), 'yyyy-MM-dd')
    });
    setIsEditing(true);
  };
  
  const handleSave = () => {
    if (!editForm.title.trim()) {
      toast.error('计划标题不能为空');
      return;
    }
    
    updatePlan(plan.id, {
      title: editForm.title,
      description: editForm.description,
      type: editForm.type,
      endDate: new Date(editForm.endDate)
    });
    
    setIsEditing(false);
    toast.success('计划已更新');
  };
  
  const handleDelete = () => {
    if (window.confirm('确定要删除这个计划吗？此操作不可撤销。')) {
      deletePlan(plan.id);
      navigate('/');
      toast.success('计划已删除');
    }
  };
  
  const handleAddSubTask = () => {
    if (!newSubTaskTitle.trim()) {
      toast.error('子任务标题不能为空');
      return;
    }
    
    addSubTask(plan.id, newSubTaskTitle);
    setNewSubTaskTitle('');
    setShowAddSubTask(false);
    toast.success('子任务已添加');
  };
  
  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case PlanStatus.COMPLETED:
        return 'text-green-600 bg-green-50';
      case PlanStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-50';
      case PlanStatus.OVERDUE:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getTypeLabel = (type: PlanType) => {
    switch (type) {
      case PlanType.DAILY:
        return '每日计划';
      case PlanType.WEEKLY:
        return '每周计划';
      case PlanType.LONG_TERM:
        return '长期计划';
      default:
        return '未知类型';
    }
  };
  
  const getStatusLabel = (status: PlanStatus) => {
    switch (status) {
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
  
  const completedSubTasks = plan.subTasks.filter(task => task.isCompleted).length;
  const totalSubTasks = plan.subTasks.length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">计划详情</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>编辑</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isEditing ? (
            /* 编辑模式 */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as PlanType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={PlanType.DAILY}>每日计划</option>
                    <option value={PlanType.WEEKLY}>每周计划</option>
                    <option value={PlanType.LONG_TERM}>长期计划</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>保存</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>取消</span>
                </button>
              </div>
            </div>
          ) : (
            /* 查看模式 */
            <div>
              {/* 计划信息 */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h2>
                {plan.description && (
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                    {getStatusLabel(plan.status)}
                  </span>
                  <span className="text-sm text-gray-600">{getTypeLabel(plan.type)}</span>
                  {plan.isRepeating && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">重复</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">截止: {format(new Date(plan.endDate), 'yyyy-MM-dd')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">更新: {format(new Date(plan.updatedAt), 'MM-dd HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">进度: {plan.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">子任务: {completedSubTasks}/{totalSubTasks}</span>
                  </div>
                </div>
              </div>
              
              {/* 进度条 */}
              {totalSubTasks > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>整体进度</span>
                    <span>{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* 子任务列表 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">子任务 ({totalSubTasks})</h3>
                  <button
                    onClick={() => setShowAddSubTask(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>添加子任务</span>
                  </button>
                </div>
                
                {showAddSubTask && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubTaskTitle}
                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                        placeholder="输入子任务标题..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
                        autoFocus
                      />
                      <button
                        onClick={handleAddSubTask}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        添加
                      </button>
                      <button
                        onClick={() => {
                          setShowAddSubTask(false);
                          setNewSubTaskTitle('');
                        }}
                        className="px-3 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {plan.subTasks.map((subTask) => (
                    <div key={subTask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => toggleSubTask(plan.id, subTask.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          subTask.isCompleted
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {subTask.isCompleted && <Check className="w-3 h-3" />}
                      </button>
                      
                      <span className={`flex-1 ${
                        subTask.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {subTask.title}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {format(new Date(subTask.createdAt), 'MM-dd')}
                      </span>
                      
                      <button
                        onClick={() => deleteSubTask(plan.id, subTask.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {totalSubTasks === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>暂无子任务</p>
                      <p className="text-sm">点击上方按钮添加子任务</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlanDetail;