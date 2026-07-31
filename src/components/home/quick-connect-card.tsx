import { Box, Button, MenuItem, Select, Typography, SvgIcon } from '@mui/material'
import { BoltOutlined, CheckCircleOutlined, FiberManualRecord } from '@mui/icons-material'
import { memo, useMemo, useState } from 'react'
import { useLockFn } from 'ahooks'

import { useProxiesData, useCoreDataStatus, useSystemData, useAppRefreshers } from '@/providers/app-data-context'
import { useVerge } from '@/hooks/use-verge'
import { showNotice } from '@/services/notice-service'
import iconDark from '@/assets/image/icon_dark.svg?react'

/**
 * QuickConnectCard - 快速连接卡片（简化版）
 *
 * 设计规格：
 * - 标题 "快速连接" + "QUICK CONNECT"
 * - 代理组下拉选择（可选）
 * - 当前节点信息展示（只读）
 * - 延迟、连接状态信息
 * - 底部蓝色渐变连接按钮
 *
 * 交互逻辑：
 * - 与左侧电源按钮双向联动
 * - 断开时按钮文字「连接」，连接后变「已连接」
 */
const QuickConnectCard = memo(() => {
  const { proxyView } = useProxiesData()
  const { isCoreDataPending } = useCoreDataStatus()
  const { sysproxy, runningMode } = useSystemData()
  const { verge, patchVerge } = useVerge()
  const { refreshSysproxy, refreshAll } = useAppRefreshers()

  const [selectedGroupName, setSelectedGroupName] = useState<string>('')

  const isConnected = sysproxy?.enable || runningMode === 'Service'

  const groups = proxyView?.groups?.filter(
    (g) => !g.hidden && (g.type === 'Selector' || g.type === 'URLTest'),
  ) || []

  // 当前选中的代理组（默认取第一个）
  const currentGroup = useMemo(() => {
    if (selectedGroupName) {
      return groups.find((g) => g.name === selectedGroupName)
    }
    return groups[0]
  }, [groups, selectedGroupName])

  const currentProxyName = currentGroup?.now || '—'

  // 获取当前节点的延迟
  const currentDelay = useMemo(() => {
    if (!currentGroup?.now || !proxyView?.records) return null
    const record = proxyView.records[currentGroup.now]
    if (!record || !record.history || record.history.length === 0) return null
    const delay = record.history[record.history.length - 1]?.delay
    return typeof delay === 'number' && delay > 0 ? delay : null
  }, [currentGroup, proxyView])

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <SvgIcon
          component={iconDark}
          sx={{ width: 18, height: 18, flexShrink: 0, opacity: 0.9 }}
          inheritViewBox
        />
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3 }}>
            快速连接
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#8A98B5', letterSpacing: '1px', fontWeight: 500 }}>
            QUICK CONNECT
          </Typography>
        </Box>
      </Box>

      {/* 代理组选择 */}
      <Box>
        <Typography sx={{ fontSize: 11, color: '#8A98B5', mb: 0.5 }}>
          代理组
        </Typography>
        <Select
          size="small"
          value={currentGroup?.name || ''}
          disabled={isCoreDataPending || groups.length === 0}
          onChange={(e) => setSelectedGroupName(e.target.value)}
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

      {/* 信息展示区域 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          p: 1,
          borderRadius: 2,
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* 当前节点 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 11, color: '#8A98B5' }}>
            当前节点
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: '#FFFFFF',
              maxWidth: '60%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentProxyName}
          </Typography>
        </Box>

        {/* 延迟 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 11, color: '#8A98B5' }}>
            延迟
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'monospace',
              color: currentDelay === null
                ? '#8A98B5'
                : currentDelay < 100
                  ? '#36D399'
                  : currentDelay < 300
                    ? '#F59E0B'
                    : '#EF4444',
            }}
          >
            {currentDelay !== null ? `${currentDelay}ms` : '—'}
          </Typography>
        </Box>

        {/* 连接状态 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 11, color: '#8A98B5' }}>
            状态
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <FiberManualRecord
              sx={{
                fontSize: 7,
                color: isConnected ? '#36D399' : '#8A98B5',
              }}
            />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: isConnected ? '#36D399' : '#8A98B5',
              }}
            >
              {isConnected ? '已连接' : '未连接'}
            </Typography>
          </Box>
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
            : 'linear-gradient(135deg, #2378F5 0%, #4F46E5 100%)',
          boxShadow: isConnected
            ? '0 4px 16px rgba(34, 197, 94, 0.35)'
            : '0 4px 16px rgba(35, 120, 245, 0.35)',
          '&:hover': {
            background: isConnected
              ? 'linear-gradient(135deg, #2BD66E 0%, #1AB553 100%)'
              : 'linear-gradient(135deg, #3B8AF8 0%, #635BF0 100%)',
            boxShadow: isConnected
              ? '0 6px 22px rgba(34, 197, 94, 0.5)'
              : '0 6px 22px rgba(35, 120, 245, 0.5)',
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
