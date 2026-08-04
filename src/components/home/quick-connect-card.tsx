import { Box, Button, MenuItem, Select, Typography, SvgIcon } from '@mui/material'
import { BoltOutlined, CheckCircleOutlined, FiberManualRecord } from '@mui/icons-material'
import { memo, useCallback, useMemo, useState } from 'react'

import { useProxiesData, useCoreDataStatus, useSystemData, useAppRefreshers } from '@/providers/app-data-context'
import { useVerge } from '@/hooks/use-verge'
import { showNotice } from '@/services/notice-service'
import iconDark from '@/assets/image/icon_dark.svg?react'

/** 带超时的 Promise 包装，防止 IPC 调用永久挂起导致按钮锁定 */
function withTimeout<T>(promise: Promise<T>, ms: number, label = '操作'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label}超时，请稍后重试`))
    }, ms)
    promise.then(
      (val) => { clearTimeout(timer); resolve(val) },
      (err) => { clearTimeout(timer); reject(err) },
    )
  })
}

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
 * - 使用 isConnected（实际系统代理状态）作为切换依据，避免配置状态与实际状态不同步
 * - 手动 loading 状态 + 超时保护，防止 useLockFn 在 IPC 挂起时永久锁定
 */
const QuickConnectCard = memo(() => {
  const { proxyView } = useProxiesData()
  const { isCoreDataPending } = useCoreDataStatus()
  const { sysproxy } = useSystemData()
  const { verge, patchVerge } = useVerge()
  const { refreshSysproxy, refreshAll } = useAppRefreshers()

  const [selectedGroupName, setSelectedGroupName] = useState<string>('')
  const [toggling, setToggling] = useState(false)

  // 使用实际代理状态判断连接：系统代理或 TUN 模式任一启用即为已连接
  // 不使用 runningMode === 'Service'，因为 Service 模式仅表示核心以服务方式运行，不代表代理已启用
  const isConnected = sysproxy?.enable || verge?.enable_tun_mode || false

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

  // 连接/断开切换 - 根据实际活跃的代理模式进行切换
  const handleToggleConnect = useCallback(async () => {
    if (toggling) return
    setToggling(true)
    try {
      if (isConnected) {
        // 断开：禁用当前活跃的代理模式（系统代理和/或 TUN 模式）
        const patch: Partial<IVergeConfig> = {}
        if (sysproxy?.enable) patch.enable_system_proxy = false
        if (verge?.enable_tun_mode) patch.enable_tun_mode = false
        await withTimeout(patchVerge(patch), 15000, '断开连接')
      } else {
        // 连接：默认使用系统代理模式
        await withTimeout(
          patchVerge({ enable_system_proxy: true }),
          15000,
          '建立连接',
        )
      }
      // 刷新操作不阻塞按钮释放，后台异步执行
      refreshSysproxy().catch(() => {})
      refreshAll().catch(() => {})
    } catch (error) {
      showNotice.error(error)
    } finally {
      setToggling(false)
    }
  }, [toggling, isConnected, sysproxy, verge, patchVerge, refreshSysproxy, refreshAll])

  return (
    <Box
      sx={{
        height: '100%',
        minWidth: 0,
        p: 1.5,
        borderRadius: 2.5,
        background: '#131A2B',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflow: 'hidden',
      }}
    >
      {/* 标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
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

      {/* 信息展示区域 - flex:1 填充剩余空间 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          p: 1,
          borderRadius: 2,
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          flex: 1,
          justifyContent: 'center',
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
        disabled={isCoreDataPending || toggling}
        onClick={handleToggleConnect}
        startIcon={isConnected ? <CheckCircleOutlined /> : <BoltOutlined />}
        sx={{
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.5px',
          flexShrink: 0,
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
        {toggling ? '处理中...' : isConnected ? '已连接' : '连接'}
      </Button>
    </Box>
  )
})

QuickConnectCard.displayName = 'QuickConnectCard'

export default QuickConnectCard
