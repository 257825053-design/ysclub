import { Box, Typography, alpha, SvgIcon } from '@mui/material'
import { LanguageOutlined, CallSplitOutlined, DiamondOutlined } from '@mui/icons-material'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLockFn } from 'ahooks'
import { type BaseConfig, closeAllConnections } from 'tauri-plugin-mihomo-api'

import { useClashConfigData, useCoreDataStatus, useAppRefreshers } from '@/providers/app-data-context'
import { useVerge } from '@/hooks/use-verge'
import { patchClashMode } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'
import { setCacheData } from '@/services/query-client'
import iconDark from '@/assets/image/icon_dark.svg?react'

/**
 * ProxyModeCard - 代理模式卡片
 *
 * 设计规格：
 * - 标题 "代理模式" + "MODE"
 * - 三个并排按钮：规则（蓝色）、全局（灰色）、直连（灰色）
 * - 底部说明文字
 */
const ProxyModeCard = memo(() => {
  const { t } = useTranslation()
  const { clashConfig } = useClashConfigData()
  const { isCoreDataPending } = useCoreDataStatus()
  const { refreshClashConfig } = useAppRefreshers()
  const { verge } = useVerge()

  const [optimisticMode, setOptimisticMode] = useState<string | null>(null)
  const currentMode = optimisticMode || clashConfig?.mode?.toLowerCase() || 'rule'

  const modes = [
    { key: 'rule', label: '规则', icon: <CallSplitOutlined sx={{ fontSize: 20 }} /> },
    { key: 'global', label: '全局', icon: <LanguageOutlined sx={{ fontSize: 20 }} /> },
    { key: 'direct', label: '直连', icon: <DiamondOutlined sx={{ fontSize: 20 }} /> },
  ]

  const handleModeChange = useLockFn(async (mode: string) => {
    if (mode === currentMode || isCoreDataPending) return
    // 自动关闭连接（与原版 ClashModeCard 行为一致）
    if (verge?.auto_close_connection) {
      closeAllConnections()
    }
    setOptimisticMode(mode)
    try {
      await patchClashMode(mode)
    } catch (error) {
      setOptimisticMode(null)
      showNotice.error(error)
      return
    }
    // 成功：写穿主源缓存，使实时 mode 立即反映新值
    setCacheData<BaseConfig>(['getClashConfig'], (old) =>
      old ? { ...old, mode: mode as BaseConfig['mode'] } : old,
    )
    // 刷新主源与后端对齐，待数据落地后再清除乐观状态
    await refreshClashConfig()
    setOptimisticMode(null)
  })

  return (
    <Box
      sx={{
        height: '100%',
        p: 1.5,
        borderRadius: 2.5,
        background: '#131A2B',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* 标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <SvgIcon
          component={iconDark}
          sx={{ width: 18, height: 18, flexShrink: 0, opacity: 0.9 }}
          inheritViewBox
        />
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3 }}>
            代理模式
          </Typography>
          <Typography sx={{ fontSize: 9, color: '#8A98B5', letterSpacing: '1px', fontWeight: 500 }}>
            MODE
          </Typography>
        </Box>
      </Box>

      {/* 三个模式按钮 */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {modes.map((mode) => {
          const isActive = currentMode === mode.key
          return (
            <Box
              key={mode.key}
              onClick={() => handleModeChange(mode.key)}
              sx={{
                flex: 1,
                py: 1,
                px: 1,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                cursor: isCoreDataPending ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: isActive ? alpha('#2378F5', 0.12) : 'rgba(255, 255, 255, 0.02)',
                border: isActive
                  ? '1px solid rgba(35, 120, 245, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  bgcolor: isActive ? alpha('#2378F5', 0.15) : 'rgba(255, 255, 255, 0.04)',
                },
              }}
            >
              <Box sx={{ color: isActive ? '#2378F5' : '#64748B' }}>
                {mode.icon}
              </Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#2378F5' : '#8A98B5',
                }}
              >
                {mode.label}
              </Typography>
            </Box>
          )
        })}
      </Box>

      {/* 说明文字 */}
      <Typography
        sx={{
          fontSize: 11,
          color: '#8A98B5',
          lineHeight: 1.5,
          pt: 1,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          flexShrink: 0,
        }}
      >
        基于预设规则智能判断流量走向，提供灵活的代理策略
      </Typography>
    </Box>
  )
})

ProxyModeCard.displayName = 'ProxyModeCard'

export default ProxyModeCard