import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import { mockDashboardStats, mockWeeklyData } from '@/api/mock';
import { QUERY_KEYS } from '@/utils/constants';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: USE_MOCK ? () => Promise.resolve(mockDashboardStats) : analyticsApi.getDashboardStats,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 5, // 5 daqiqada bir yangilansin
  });
}

export function useWeeklyData() {
  return useQuery({
    queryKey: QUERY_KEYS.weeklyData,
    queryFn: USE_MOCK ? () => Promise.resolve(mockWeeklyData) : analyticsApi.getWeeklyData,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
