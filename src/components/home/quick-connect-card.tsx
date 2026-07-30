import { Box, Button, MenuItem, Select, Typography, alpha } from '@mui/material'
import { BoltOutlined, RefreshOutlined, CheckCircleOutlined } from '@mui/icons-material'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLockFn } from 'ahooks'

import { useProxiesData, useCoreDataStatus, useSystemData, useAppRefreshers } from '@/providers/app-data-context'
import { useVerge } from '@/hooks/use-verge'
import { showNotice } from '@/services/notice-service'

/**
 * QuickConnectCard - 快速连接卡片
 *
 * 设计规格：
 * - 标题 "快速连接" + "QUICK CONNECT"
 * - 三个下拉选择：自动选择、代理组、节点
 * - 底部蓝色渐变连接按钮
 *
 * 交互逻辑：
 * - 与左侧电源按钮双向联动
 * - 断开时按钮文字「连接」，连接后变「已连接」
 * - 点击切换代理启停状态
 */
const QuickConnectCard = memo(() => {
  const { t } = useTranslation()
  const { proxyView } = useProxiesData()
  const { isCoreDataPending } = useCoreDataStatus()
  const { sysproxy, runningMode } = useSystemData()
  const { verge, patchVerge } = useVerge()
  const { refreshSysproxy, refreshAll } = useAppRefreshers()

  const isConnected = sysproxy?.enable || runningMode === 'Service'

  const groups = proxyView?.groups?.filter(
    (g) => !g.hidden && (g.type === 'Selector' || g.type === 'URLTest'),
  ) || []
  const currentGroup = groups[0]
  const currentProxy = currentGroup?.now || '自动选择'

  // 连接/断开切换 - 与电源按钮联动
  const handleToggleConnect = useLockFn(async () => {
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
      <Box>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3 }}>
          快速连接
        </Typography>
        <Typography sx={{ fontSize: 10, color: '#8A98B5', letterSpacing: '1px', fontWeight: 500 }}>
          QUICK CONNECT
        </Typography>
      </Box>

      {/* 下拉选择器 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {/* 自动选择 */}
        <Box>
          <Typography sx={{ fontSize: 11, color: '#8A98B5', mb: 0.5 }}>
            自动选择 URLTest
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Select
              size="small"
              value={currentProxy}
              disabled={isCoreDataPending}
              sx={{
                flex: 1,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                color: '#FFFFFF',
                fontSize: 13,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(35, 120, 245, 0.3)',
                },
                '& .MuiSelect-select': { py: 0.5 },
              }}
            >
              <MenuItem value={currentProxy}>{currentProxy}</MenuItem>
            </Select>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                color: '#8A98B5',
                '&:hover': { color: '#2378F5', borderColor: 'rgba(35, 120, 245, 0.3)' },
              }}
            >
              <RefreshOutlined sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Box>

        {/* 代理组 */}
        <Box>
          <Typography sx={{ fontSize: 11, color: '#8A98B5', mb: 0.5 }}>
            代理组
          </Typography>
          <Select
            size="small"
            value={currentGroup?.name || ''}
            disabled={isCoreDataPending}
            sx={{
              width: '100%',
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              color: '#FFFFFF',
              fontSize: 13,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(35, 120, 245, 0.3)',
              },
              '& .MuiSelect-select': { py: 0.5 },
            }}
          >
            {groups.map((g) => (
              <MenuItem key={g.name} value={g.name}>
                {g.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* 节点 */}
        <Box>
          <Typography sx={{ fontSize: 11, color: '#8A98B5', mb: 0.5 }}>
            节点
          </Typography>
          <Select
            size="small"
            value={currentProxy}
            disabled={isCoreDataPending}
            sx={{
              width: '100%',
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              color: '#FFFFFF',
              fontSize: 13,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(35, 120, 245, 0.3)',
              },
              '& .MuiSelect-select': { py: 0.5 },
            }}
          >
            <MenuItem value={currentProxy}>{currentProxy}</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* 连接按钮 - 与电源按钮联动 */}
      <Button
        variant="contained"
        fullWidth
        disabled={isCoreDataPending}
        onClick={handleToggleConnect}
        startIcon={isConnected ? <CheckCircleOutlined /> : <BoltOutlined />}
        sx={{
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.5px',
          background: isConnected
            ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
            : 'linear-gradient(135deg, #2176F4 0%, #4F46E5 100%)',
          boxShadow: isConnected
            ? '0 4px 16px rgba(34, 197, 94, 0.35)'
            : '0 4px 16px rgba(33, 118, 244, 0.35)',
          '&:hover': {
            background: isConnected
              ? 'linear-gradient(135deg, #2BD66E 0%, #1AB553 100%)'
              : 'linear-gradient(135deg, #3B8AF8 0%, #635BF0 100%)',
            boxShadow: isConnected
              ? '0 6px 22px rgba(34, 197, 94, 0.5)'
              : '0 6px 22px rgba(33, 118, 244, 0.5)',
          },
        }}
      >
        {isConnected ? '已连接' : '连接'}
      </Button>
    </Box>
  )
})

QuickConnectCard.displayName = 'QuickConnectCard'

export default QuickConnectCard
