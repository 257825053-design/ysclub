import { Box, Typography } from '@mui/material'
import { PowerSettingsNewOutlined } from '@mui/icons-material'
import { memo, useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLockFn } from 'ahooks'

import { useSystemData, useAppRefreshers } from '@/providers/app-data-context'
import { useUptimeData } from '@/providers/app-data-context'
import { useVerge } from '@/hooks/use-verge'
import { showNotice } from '@/services/notice-service'

const formatUptime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * ConnectionPanel - 左侧导航栏底部连接控制面板
 *
 * 设计规格：
 * - 半透明深色圆角矩形背景
 * - 状态文字：青色"已连接" + 连接时长
 * - 中心超大圆形电源开关按钮，外圈渐变蓝光光晕
 * - 版本号 + 更新状态
 *
 * 交互逻辑：
 * - 电源按钮可点击，切换代理启停
 * - 与右侧快速连接按钮双向联动
 * - 断开时计时器显示 01:00:00，连接后从 00:00:00 开始正向计时
 */
const ConnectionPanel = memo(() => {
  const { t } = useTranslation()
  const { sysproxy, runningMode } = useSystemData()
  const { uptime } = useUptimeData()
  const { verge, patchVerge } = useVerge()
  const { refreshSysproxy, refreshAll } = useAppRefreshers()

  const isConnected = sysproxy?.enable || runningMode === 'Service'

  // ========== 连接计时器逻辑 ==========
  const [connectTimer, setConnectTimer] = useState(0)
  const [hasConnected, setHasConnected] = useState(false)
  const prevConnectedRef = useRef(isConnected)

  useEffect(() => {
    // 检测从断开→连接的转变，重置计时器
    if (isConnected && !prevConnectedRef.current) {
      setConnectTimer(0)
      setHasConnected(true)
    }
    prevConnectedRef.current = isConnected
  }, [isConnected])

  // 连接状态下每秒递增计时器
  useEffect(() => {
    if (!isConnected) return
    const interval = setInterval(() => {
      setConnectTimer((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isConnected])

  // 计时器显示：未连接且从未连接过显示 01:00:00，连接中显示递增计时，断开后暂停
  const timerDisplay = !isConnected && !hasConnected
    ? '01:00:00'
    : formatUptime(connectTimer)

  // ========== 电源按钮点击 ==========
  const handleToggleProxy = useLockFn(async () => {
    try {
      const currentEnable = verge?.enable_system_proxy ?? false
      await patchVerge({ enable_system_proxy: !currentEnable })
      await refreshSysproxy()
      await refreshAll()
    } catch (error) {
      showNotice.error(error)
    }
  })

  return (
    <Box
      sx={{
        mx: 1.5,
        mb: 1,
        p: 2,
        borderRadius: 3,
        background: 'rgba(20, 28, 48, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      {/* 状态文字 */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: isConnected ? '#36D399' : '#8A98B5',
            letterSpacing: '0.5px',
          }}
        >
          {isConnected ? t('home.components.currentProxy.status.latencyExcellent') : '未连接'}
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            color: '#8A98B5',
            mt: 0.3,
            fontFamily: 'monospace',
          }}
        >
          {timerDisplay}
        </Typography>
      </Box>

      {/* 中心圆形电源按钮 */}
      <Box
        onClick={handleToggleProxy}
        sx={{
          position: 'relative',
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          background: isConnected
            ? 'linear-gradient(135deg, #2378F5 0%, #4F46E5 100%)'
            : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
          boxShadow: isConnected
            ? '0 0 24px rgba(35, 120, 245, 0.4), 0 0 48px rgba(35, 120, 245, 0.15)'
            : '0 2px 12px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            transform: 'scale(1.08)',
            boxShadow: isConnected
              ? '0 0 32px rgba(35, 120, 245, 0.55), 0 0 64px rgba(35, 120, 245, 0.25)'
              : '0 4px 16px rgba(0, 0, 0, 0.4)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {/* 外圈光晕 */}
        {isConnected && (
          <Box
            sx={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '2px solid rgba(35, 120, 245, 0.25)',
              animation: 'pulse-ring 2.5s ease-out infinite',
            }}
          />
        )}
        <PowerSettingsNewOutlined
          sx={{
            fontSize: 28,
            color: isConnected ? '#FFFFFF' : '#64748B',
            filter: isConnected ? 'drop-shadow(0 0 6px rgba(255,255,255,0.3))' : 'none',
          }}
        />
      </Box>

      {/* 版本信息 */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: 11,
            color: '#8A98B5',
            fontFamily: 'monospace',
          }}
        >
          V.YS.1.0.0
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.3 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#36D399',
            }}
          />
          <Typography sx={{ fontSize: 10, color: '#36D399', fontWeight: 500 }}>
            已是最新版本
          </Typography>
        </Box>
      </Box>
    </Box>
  )
})

ConnectionPanel.displayName = 'ConnectionPanel'

export default ConnectionPanel
