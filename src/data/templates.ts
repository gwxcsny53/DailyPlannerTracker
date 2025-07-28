import { PlanTemplate, PlanType } from '@/types';

export const planTemplates: PlanTemplate[] = [
  {
    id: 'morning-routine',
    title: '晨间例行',
    description: '建立健康的晨间习惯',
    type: PlanType.DAILY,
    defaultDuration: 60,
    subTasks: [
      '喝一杯水',
      '做10分钟运动',
      '阅读15分钟',
      '制定今日计划'
    ]
  },
  {
    id: 'work-review',
    title: '工作复盘',
    description: '每日工作总结与反思',
    type: PlanType.DAILY,
    defaultDuration: 30,
    subTasks: [
      '回顾今日完成的任务',
      '总结遇到的问题',
      '制定明日计划'
    ]
  },
  {
    id: 'fitness-plan',
    title: '健身计划',
    description: '保持身体健康的运动计划',
    type: PlanType.DAILY,
    defaultDuration: 45,
    subTasks: [
      '热身运动',
      '主要训练',
      '拉伸放松'
    ]
  },
  {
    id: 'learn-skill',
    title: '学习新技能',
    description: '持续学习提升自己',
    type: PlanType.WEEKLY,
    defaultDuration: 120,
    subTasks: [
      '选择学习资料',
      '制定学习计划',
      '实践练习',
      '总结笔记'
    ]
  },
  {
    id: 'reading-challenge',
    title: '阅读挑战',
    description: '培养阅读习惯',
    type: PlanType.WEEKLY,
    defaultDuration: 90,
    subTasks: [
      '选择阅读书籍',
      '设定阅读目标',
      '记录读书笔记'
    ]
  },
  {
    id: 'project-milestone',
    title: '项目里程碑',
    description: '重要项目的阶段性目标',
    type: PlanType.LONG_TERM,
    defaultDuration: 240,
    subTasks: [
      '项目规划',
      '任务分解',
      '进度跟踪',
      '成果验收'
    ]
  }
];