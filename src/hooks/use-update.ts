import { setCacheData, useQuery } from '@/services/query-client'

const LAST_CHECK_KEY = 'last_check_update'

export const readLastCheckTime = (): number | null => {
  const stored = localStorage.getItem(LAST_CHECK_KEY)
  if (!stored) return null
  const ts = parseInt(stored, 10)
  return isNaN(ts) ? null : ts
}

export const updateLastCheckTime = (timestamp?: number): number => {
  const now = timestamp ?? Date.now()
  localStorage.setItem(LAST_CHECK_KEY, now.toString())
  setCacheData([LAST_CHECK_KEY], now)
  return now
}

// --- useUpdate hook ---

export const useUpdate = (_enabled: boolean = true) => {
  // ===== 更新检测功能已彻底禁用，锁定当前版本 =====
  // 用户升级只能通过站外网站下载安装包
  // 预留接口：未来需要启用更新检测时，恢复以下注释代码即可

  // const shouldCheck = false
  // const {
  //   data: updateInfo,
  //   refetch: checkUpdate,
  //   isFetching: isValidating,
  // } = useQuery({
  //   queryKey: ['checkUpdate'],
  //   queryFn: async () => {
  //     const result = await checkUpdateSafe()
  //     updateLastCheckTime()
  //     return result
  //   },
  //   enabled: shouldCheck,
  //   retry: 2,
  //   staleTime: 60 * 60 * 1000,
  //   refetchInterval: 24 * 60 * 60 * 1000,
  //   refetchIntervalInBackground: false,
  //   refetchOnWindowFocus: false,
  // })

  // Shared last check timestamp
  const { data: lastCheckUpdate } = useQuery({
    queryKey: [LAST_CHECK_KEY],
    queryFn: readLastCheckTime,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return {
    updateInfo: null as any,
    checkUpdate: async () => null,
    loading: false,
    lastCheckUpdate: lastCheckUpdate ?? null,
  }
}
