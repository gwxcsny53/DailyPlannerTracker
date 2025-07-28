import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanStore } from '@/store/planStore';
import { ArrowLeft, Award, Trophy, Star, Target, Flame, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const Achievements: React.FC = () => {
  const navigate = useNavigate();
  const { achievements, getStatistics } = usePlanStore();
  const stats = getStatistics();
  
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);
  
  const motivationalMessages = [
    '每一个小目标的完成，都是向梦想迈进的一步！',
    '坚持不懈，成功就在前方等着你！',
    '今天的努力，是明天成功的基石。',
    '相信自己，你比想象中更强大！',
    '每一次完成计划，都是对自己的一次超越。'
  ];
  
  const todayMessage = motivationalMessages[new Date().getDay() % motivationalMessages.length];
  
  const getProgressToNextAchievement = () => {
    const nextAchievements = [
      {
        id: 'streak_7',
        title: '坚持一周',
        current: stats.currentStreak,
        target: 7,
        unit: '天'
      },
      {
        id: 'completion_90',
        title: '完美主义者',
        current: stats.completionRate,
        target: 90,
        unit: '%'
      },
      {
        id: 'total_50',
        title: '计划达人',
        current: stats.completedPlans,
        target: 50,
        unit: '个'
      }
    ];
    
    return nextAchievements
      .filter(achievement => {
        const isUnlocked = achievements.find(a => a.id === achievement.id)?.isUnlocked;
        return !isUnlocked && achievement.current < achievement.target;
      })
      .sort((a, b) => (a.target - a.current) - (b.target - b.current))[0];
  };
  
  const nextAchievement = getProgressToNextAchievement();
  
  const AchievementCard: React.FC<{
    achievement: any;
    isUnlocked: boolean;
  }> = ({ achievement, isUnlocked }) => {
    return (
      <div className={`relative p-6 rounded-lg border-2 transition-all duration-300 ${
        isUnlocked
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg'
          : 'bg-gray-50 border-gray-200'
      }`}>
        {/* 徽章图标 */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto ${
          isUnlocked
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
            : 'bg-gray-300'
        }`}>
          {isUnlocked ? (
            <span className="text-white">{achievement.icon}</span>
          ) : (
            <span className="text-gray-500">🔒</span>
          )}
        </div>
        
        {/* 成就信息 */}
        <div className="text-center">
          <h3 className={`font-bold text-lg mb-2 ${
            isUnlocked ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {achievement.title}
          </h3>
          <p className={`text-sm mb-3 ${
            isUnlocked ? 'text-gray-700' : 'text-gray-400'
          }`}>
            {achievement.description}
          </p>
          
          {isUnlocked && achievement.unlockedAt && (
            <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full inline-block">
              {format(new Date(achievement.unlockedAt), 'yyyy-MM-dd')} 解锁
            </div>
          )}
        </div>
        
        {/* 解锁效果 */}
        {isUnlocked && (
          <div className="absolute -top-2 -right-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Award className="w-6 h-6 text-yellow-600" />
            <h1 className="text-xl font-semibold text-gray-900">成就中心</h1>
          </div>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 激励横幅 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">继续加油！</h2>
              <p className="text-blue-100 mb-4">{todayMessage}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  <span>连续打卡 {stats.currentStreak} 天</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>完成率 {stats.completionRate}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>已解锁 {unlockedAchievements.length} 个成就</span>
                </div>
              </div>
            </div>
            <div className="text-6xl opacity-20">
              🎯
            </div>
          </div>
        </div>
        
        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalPlans}</div>
            <div className="text-sm text-gray-600">总计划数</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.completedPlans}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">连续打卡</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.longestStreak}</div>
            <div className="text-sm text-gray-600">最长连击</div>
          </div>
        </div>
        
        {/* 下一个成就进度 */}
        {nextAchievement && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">下一个成就</h3>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{nextAchievement.title}</h4>
                <p className="text-sm text-gray-600">
                  {nextAchievement.current} / {nextAchievement.target} {nextAchievement.unit}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">还需</div>
                <div className="font-bold text-blue-600">
                  {nextAchievement.target - nextAchievement.current} {nextAchievement.unit}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((nextAchievement.current / nextAchievement.target) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}
        
        {/* 已解锁成就 */}
        {unlockedAchievements.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900 text-lg">已解锁成就</h3>
              <span className="text-sm text-gray-500">({unlockedAchievements.length})</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* 未解锁成就 */}
        {lockedAchievements.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900 text-lg">待解锁成就</h3>
              <span className="text-sm text-gray-500">({lockedAchievements.length})</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={false}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* 空状态 */}
        {achievements.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无成就</h3>
            <p className="text-gray-600">开始创建和完成计划来解锁成就吧！</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Achievements;