import { PlanType } from '@/types';
import { addDays, addWeeks, addMonths, startOfDay, endOfDay } from 'date-fns';

interface ParsedPlan {
  title: string;
  type: PlanType;
  startDate?: string;
  endDate?: string;
  isRepeating: boolean;
  repeatInterval?: number;
}

export function parseNaturalLanguage(input: string): ParsedPlan {
  const text = input.toLowerCase().trim();
  
  // 默认值
  let planType: PlanType = PlanType.DAILY;
  let isRepeating = false;
  let repeatInterval: number | undefined = undefined;
  let startDate: Date | undefined = undefined;
  let endDate: Date | undefined = undefined;
  
  const now = new Date();
  
  // 解析计划类型
  if (text.includes('每日') || text.includes('每天') || text.includes('天天')) {
    planType = PlanType.DAILY;
    isRepeating = true;
    repeatInterval = 1;
  } else if (text.includes('每周') || text.includes('每星期') || text.includes('周周')) {
    planType = PlanType.WEEKLY;
    isRepeating = true;
    repeatInterval = 1;
  } else if (text.includes('长期') || text.includes('月') || text.includes('年')) {
    planType = PlanType.LONG_TERM;
  }
  
  // 解析时间
  if (text.includes('今天')) {
    startDate = startOfDay(now);
    endDate = endOfDay(now);
  } else if (text.includes('明天')) {
    startDate = startOfDay(addDays(now, 1));
    endDate = endOfDay(addDays(now, 1));
  } else if (text.includes('本周')) {
    startDate = startOfDay(now);
    endDate = endOfDay(addDays(now, 7));
  } else if (text.includes('下周')) {
    startDate = startOfDay(addDays(now, 7));
    endDate = endOfDay(addDays(now, 14));
  } else if (text.includes('一个月') || text.includes('1个月')) {
    startDate = startOfDay(now);
    endDate = endOfDay(addMonths(now, 1));
  } else if (text.includes('三个月') || text.includes('3个月')) {
    startDate = startOfDay(now);
    endDate = endOfDay(addMonths(now, 3));
  } else {
    // 默认从今天开始
    startDate = startOfDay(now);
  }
  
  // 提取纯净的标题（移除时间相关的词汇）
  let cleanTitle = input
    .replace(/每日|每天|天天|每周|每星期|周周|长期/g, '')
    .replace(/今天|明天|本周|下周|一个月|三个月|1个月|3个月/g, '')
    .replace(/持续|坚持|连续/g, '')
    .trim();
  
  // 如果标题为空，使用原始输入
  if (!cleanTitle) {
    cleanTitle = input;
  }
  
  return {
    title: cleanTitle,
    type: planType,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    isRepeating,
    repeatInterval
  };
}