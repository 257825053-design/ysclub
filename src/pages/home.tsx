import {
  DnsOutlined,
  LanguageOutlined,
  LeaderboardOutlined,
  LinkOutlined,
  OpenInNewOutlined,
  PlaceOutlined,
  PowerSettingsNewOutlined,
  RouterOutlined,
  SettingsOutlined,
  SpeedOutlined,
  TimelineOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useLockFn } from 'ahooks'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { BasePage } from '@/components/base'
import { EnhancedCanvasTrafficGraph } from '@/components/home/enhanced-canvas-traffic-graph'
import { useClash } from '@/hooks/use-clash'
import { useConnectionSummaryData } from '@/hooks/use-connection-data'
import { useMemoryData } from '@/hooks/use-memory-data'
import { useProfiles } from '@/hooks/use-profiles'
import { useTrafficData } from '@/hooks/use-traffic-data'
import { useVerge } from '@/hooks/use-verge'
import { useVisibility } from '@/hooks/use-visibility'
import {
  useAppRefreshers,
  useClashConfigData,
  useCoreDataStatus,
  useProxiesData,
  useSystemData,
  useUptimeData,
} from '@/providers/app-data-context'
import { patchClashMode, restartCore } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'
import parseTraffic from '@/utils/parse-traffic'

// ==================== 工具函数 ====================

const formatUptime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

// ==================== 子组件 ====================

// Banner 区域 - 顶部状态概览
const BannerSection = memo(() => {
  const { t } = useTranslation()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { current } = useProfiles()
  const { clashConfig } = useClashConfigData()
  const { sysproxy, runningMode } = useSystemData()

  const mode = clashConfig?.mode?.toLowerCase() || 'rule'
  const isConnected = sysproxy?.enable || runningMode === 'Service'

  const modeLabels: Record<string, string> = {
    rule: t('home.components.clashMode.labels.rule'),
    global: t('home.components.clashMode.labels.global'),
    direct: t('home.components.clashMode.labels.direct'),
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        p: 3,
        borderRadius: 3,
        background: isDark
          ? 'linear-gradient(135deg, rgba(22, 119, 255, 0.15) 0%, rgba(79, 70, 229, 0.08) 100%)'
          : 'linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(79, 70, 229, 0.04) 100%)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        overflow: 'hidden',
      }}
    >
      {/* 背景装饰 */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: '1.75rem',
              letterSpacing: '-0.5px',
              mb: 0.5,
              background: isDark
                ? 'linear-gradient(90deg, #FFFFFF 0%, #94A3B8 100%)'
                : 'linear-gradient(90deg, #000000 0%, #475569 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            YSCLUB
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            {t('home.page.title')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Chip
            size="small"
            icon={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#22C55E' : '#EF4444',
                  animation: isConnected ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                  ml: 1,
                }}
              />
            }
            label={isConnected ? t('home.components.currentProxy.status.latencyExcellent') : t('home.components.currentProxy.status.noProxyNode')}
            sx={{
              bgcolor: alpha(isConnected ? '#22C55E' : '#EF4444', 0.1),
              color: isConnected ? '#22C55E' : '#EF4444',
              border: `1px solid ${alpha(isConnected ? '#22C55E' : '#EF4444', 0.3)}`,
              fontWeight: 600,
              '& .MuiChip-icon': { mr: -0.5 },
            }}
          />
          <Chip
            size="small"
            label={modeLabels[mode] || mode}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          />
        </Stack>
      </Stack>

      {/* 当前节点信息 */}
      {current && (
        <Stack direction="row" spacing={3} sx={{ mt: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlaceOutlined sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary">
              {current.name || t('home.components.currentProxy.labels.noActiveNode')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineOutlined sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary">
              {modeLabels[mode] || mode}
            </Typography>
          </Box>
        </Stack>
      )}
    </Box>
  )
})
BannerSection.displayName = 'BannerSection'

// 连接中心 - 中央大按钮
const ConnectionHub = memo(() => {
  const { t } = useTranslation()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { sysproxy, runningMode } = useSystemData()
  const { refreshSysproxy } = useAppRefreshers()
  const [isProcessing, setIsProcessing] = useState(false)

  const isConnected = sysproxy?.enable || runningMode === 'Service'

  const toggleConnection = useLockFn(async () => {
    setIsProcessing(true)
    try {
      if (isConnected) {
        await restartCore()
      } else {
        await restartCore()
      }
      await refreshSysproxy()
    } catch (err) {
      showNotice.error(err)
    } finally {
      setIsProcessing(false)
    }
  })

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Box
        onClick={toggleConnection}
        sx={{
          position: 'relative',
          width: 140,
          height: 140,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isProcessing ? 'wait' : 'pointer',
          transition: 'all 0.3s ease',
          background: isConnected
            ? 'linear-gradient(135deg, #1677FF 0%, #4F46E5 100%)'
            : isDark
              ? 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
          boxShadow: isConnected
            ? '0 0 30px rgba(22, 119, 255, 0.4), 0 0 60px rgba(22, 119, 255, 0.2), inset 0 0 20px rgba(255,255,255,0.1)'
            : '0 4px 20px rgba(0,0,0,0.15), inset 0 0 20px rgba(255,255,255,0.05)',
          animation: isConnected && !isProcessing ? 'breathe 2.5s ease-in-out infinite' : 'none',
          '&:hover': {
            transform: isProcessing ? 'none' : 'scale(1.05)',
            boxShadow: isConnected
              ? '0 0 40px rgba(22, 119, 255, 0.5), 0 0 80px rgba(22, 119, 255, 0.3), inset 0 0 20px rgba(255,255,255,0.15)'
              : '0 6px 30px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.1)',
          },
          '&:active': {
            transform: isProcessing ? 'none' : 'scale(0.98)',
          },
        }}
      >
        {/* 外圈装饰 */}
        <Box
          sx={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: `2px solid ${alpha(theme.palette.primary.main, isConnected ? 0.3 : 0.1)}`,
            animation: isConnected ? 'pulse-ring 2.5s ease-out infinite' : 'none',
          }}
        />
        <PowerSettingsNewOutlined
          sx={{
            fontSize: 48,
            color: isConnected ? '#FFFFFF' : isDark ? '#64748B' : '#94A3B8',
            transition: 'color 0.3s ease',
          }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{
          mt: 2,
          fontWeight: 600,
          color: isConnected ? theme.palette.primary.main : 'text.secondary',
          transition: 'color 0.3s ease',
        }}
      >
        {isConnected ? t('home.components.currentProxy.status.latencyExcellent') : t('home.components.currentProxy.status.noProxyNode')}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, opacity: 0.7 }}>
        {isProcessing ? t('shared.statuses.loading') : 'Click to toggle'}
      </Typography>
    </Box>
  )
})
ConnectionHub.displayName = 'ConnectionHub'

// 快速选择卡片
const QuickSelectCard = memo(
  ({
    title,
    icon,
    children,
  }: {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
  }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    return (
      <Box
        sx={{
          flex: 1,
          minWidth: 200,
          p: 2.5,
          borderRadius: 3,
          bgcolor: isDark ? alpha('#111B35', 0.6) : alpha('#F1F5F9', 0.8),
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.3),
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
          },
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Stack>
        {children}
      </Box>
    )
  },
)
QuickSelectCard.displayName = 'QuickSelectCard'

// 代理模式选择
const ModeSelector = memo(() => {
  const { t } = useTranslation()
  const { clashConfig } = useClashConfigData()
  const { isCoreDataPending } = useCoreDataStatus()
  const { refreshClashConfig } = useAppRefreshers()
  const [optimisticMode, setOptimisticMode] = useState<string | null>(null)

  const currentMode = optimisticMode || clashConfig?.mode?.toLowerCase() || 'rule'

  const modes = ['rule', 'global', 'direct'] as const

  const handleModeChange = useLockFn(async (mode: string) => {
    if (mode === currentMode) return
    setOptimisticMode(mode)
    try {
      await patchClashMode(mode)
      await refreshClashConfig()
    } catch (error) {
      setOptimisticMode(null)
      showNotice.error(error)
    } finally {
      setOptimisticMode(null)
    }
  })

  return (
    <QuickSelectCard
      title={t('home.page.cards.proxyMode')}
      icon={<RouterOutlined sx={{ fontSize: 20 }} />}
    >
      <Stack spacing={1}>
        {modes.map((mode) => (
          <Button
            key={mode}
            fullWidth
            size="small"
            variant={currentMode === mode ? 'contained' : 'outlined'}
            onClick={() => handleModeChange(mode)}
            disabled={isCoreDataPending}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'capitalize',
              borderRadius: 2,
              py: 0.8,
              borderColor: currentMode === mode ? 'primary.main' : alpha('#64748B', 0.3),
              bgcolor: currentMode === mode ? 'primary.main' : 'transparent',
              color: currentMode === mode ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                bgcolor: currentMode === mode ? 'primary.dark' : alpha('primary.main', 0.08),
              },
            }}
          >
            {t(`home.components.clashMode.labels.${mode}`)}
          </Button>
        ))}
      </Stack>
    </QuickSelectCard>
  )
})
ModeSelector.displayName = 'ModeSelector'

// 节点选择器
const ProxySelector = memo(() => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { proxyView } = useProxiesData()
  const { clashConfig } = useClashConfigData()

  const mode = clashConfig?.mode?.toLowerCase() || 'rule'
  const isDirectMode = mode === 'direct'

  const currentGroup = proxyView?.groups.find((g) => g.name === 'GLOBAL') || proxyView?.groups[0]
  const currentProxy = currentGroup?.now || '-'

  const groups = proxyView?.groups.filter((g) => !g.hidden && (g.type === 'Selector' || g.type === 'URLTest')) || []

  return (
    <QuickSelectCard
      title={t('home.components.currentProxy.title')}
      icon={<LanguageOutlined sx={{ fontSize: 20 }} />}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          {t('home.components.currentProxy.labels.group')}
        </Typography>
        <Select
          fullWidth
          size="small"
          value={currentGroup?.name || ''}
          disabled={isDirectMode}
          sx={{
            borderRadius: 2,
            bgcolor: 'background.paper',
            '& .MuiSelect-select': { py: 1 },
          }}
        >
          {groups.map((g) => (
            <MenuItem key={g.name} value={g.name}>
              {g.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          {t('home.components.currentProxy.labels.proxy')}
        </Typography>
        <Select
          fullWidth
          size="small"
          value={currentProxy}
          disabled={isDirectMode}
          sx={{
            borderRadius: 2,
            bgcolor: 'background.paper',
            '& .MuiSelect-select': { py: 1 },
          }}
        >
          <MenuItem value={currentProxy}>{currentProxy}</MenuItem>
        </Select>
      </Box>

      <Button
        fullWidth
        variant="outlined"
        size="small"
        endIcon={<OpenInNewOutlined sx={{ fontSize: 16 }} />}
        onClick={() => navigate('/proxies')}
        sx={{ borderRadius: 2, textTransform: 'none' }}
      >
        {t('layout.components.navigation.tabs.proxies')}
      </Button>
    </QuickSelectCard>
  )
})
ProxySelector.displayName = 'ProxySelector'

// 订阅信息卡片
const ProfileInfoCard = memo(() => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const { current } = useProfiles()

  const [used, usedUnit] = parseTraffic((current?.extra?.upload || 0) + (current?.extra?.download || 0))
  const [total, totalUnit] = parseTraffic(current?.extra?.total || 0)
  const percentage = current?.extra?.total
    ? Math.min(Math.round(((current?.extra?.upload || 0) + (current?.extra?.download || 0)) / current?.extra?.total * 100), 100)
    : 0

  return (
    <QuickSelectCard
      title={t('profiles.page.title')}
      icon={<DnsOutlined sx={{ fontSize: 20 }} />}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
        {current?.name || t('home.components.currentProxy.labels.noActiveNode')}
      </Typography>

      {current?.extra && (
        <>
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {t('shared.labels.usedTotal')}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {percentage}%
              </Typography>
            </Stack>
            <Box
              sx={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${percentage}%`,
                  height: '100%',
                  borderRadius: 3,
                  bgcolor: 'primary.main',
                  transition: 'width 0.5s ease',
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {used} {usedUnit} / {total} {totalUnit}
            </Typography>
          </Box>
        </>
      )}

      <Button
        fullWidth
        variant="outlined"
        size="small"
        endIcon={<OpenInNewOutlined sx={{ fontSize: 16 }} />}
        onClick={() => navigate('/profile')}
        sx={{ borderRadius: 2, textTransform: 'none' }}
      >
        {t('layout.components.navigation.tabs.profiles')}
      </Button>
    </QuickSelectCard>
  )
})
ProfileInfoCard.displayName = 'ProfileInfoCard'

// 实时流量统计
const TrafficStatsSection = memo(() => {
  const { t } = useTranslation()
  const theme = useTheme()
  const pageVisible = useVisibility()
  const { verge } = useVerge()
  const trafficGraph = verge?.traffic_graph ?? true

  const {
    response: { data: traffic },
  } = useTrafficData({ enabled: pageVisible })
  const {
    response: { data: memory },
  } = useMemoryData({ enabled: pageVisible })
  const {
    response: { data: connectionSummary },
  } = useConnectionSummaryData({ enabled: pageVisible })

  const [up, upUnit] = parseTraffic(traffic?.up || 0)
  const [down, downUnit] = parseTraffic(traffic?.down || 0)
  const [upTotal, upTotalUnit] = parseTraffic(traffic?.upTotal || 0)
  const [downTotal, downTotalUnit] = parseTraffic(traffic?.downTotal || 0)
  const [mem, memUnit] = parseTraffic(memory?.inuse || 0)

  const statItems = [
    {
      label: t('home.components.traffic.metrics.uploadSpeed'),
      value: up,
      unit: `${upUnit}/s`,
      color: '#F59E0B',
    },
    {
      label: t('home.components.traffic.metrics.downloadSpeed'),
      value: down,
      unit: `${downUnit}/s`,
      color: '#1677FF',
    },
    {
      label: t('home.components.traffic.metrics.activeConnections'),
      value: connectionSummary?.activeConnectionCount || 0,
      unit: '',
      color: '#22C55E',
    },
    {
      label: t('shared.labels.uploaded'),
      value: upTotal,
      unit: upTotalUnit,
      color: '#F59E0B',
    },
    {
      label: t('shared.labels.downloaded'),
      value: downTotal,
      unit: downTotalUnit,
      color: '#1677FF',
    },
    {
      label: t('home.components.traffic.metrics.memoryUsage'),
      value: mem,
      unit: memUnit,
      color: '#EF4444',
    },
  ]

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.5),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
        <SpeedOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t('home.page.cards.trafficStats')}
        </Typography>
      </Stack>

      {trafficGraph && (
        <Box
          sx={{
            height: 140,
            mb: 2,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: alpha(theme.palette.background.paper, 0.3),
          }}
        >
          <EnhancedCanvasTrafficGraph />
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 1.5,
        }}
      >
        {statItems.map((item) => (
          <Box
            key={item.label}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(item.color, 0.05),
              border: `1px solid ${alpha(item.color, 0.15)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(item.color, 0.08),
                borderColor: alpha(item.color, 0.3),
              },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              {item.label}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', color: item.color }}>
                {item.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.unit}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  )
})
TrafficStatsSection.displayName = 'TrafficStatsSection'

// 快捷工具栏
const QuickTools = memo(() => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sysproxy } = useSystemData()
  const isConnected = sysproxy?.enable

  const tools = [
    {
      icon: <SpeedOutlined />,
      label: t('tests.page.title'),
      path: '/test',
      disabled: !isConnected,
    },
    {
      icon: <VisibilityOutlined />,
      label: t('home.components.ipInfo.title'),
      path: '/test',
      disabled: false,
    },
    {
      icon: <LeaderboardOutlined />,
      label: t('layout.components.navigation.tabs.connections'),
      path: '/connections',
      disabled: !isConnected,
    },
    {
      icon: <LinkOutlined />,
      label: t('layout.components.navigation.tabs.rules'),
      path: '/rules',
      disabled: !isConnected,
    },
    {
      icon: <TimelineOutlined />,
      label: t('layout.components.navigation.tabs.logs'),
      path: '/logs',
      disabled: false,
    },
    {
      icon: <SettingsOutlined />,
      label: t('layout.components.navigation.tabs.settings'),
      path: '/settings',
      disabled: false,
    },
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: 1.5,
      }}
    >
      {tools.map((tool) => (
        <Button
          key={tool.path + tool.label}
          variant="outlined"
          disabled={tool.disabled}
          onClick={() => navigate(tool.path)}
          sx={{
            flexDirection: 'column',
            py: 2,
            px: 1,
            borderRadius: 2,
            borderColor: alpha('#64748B', 0.2),
            color: 'text.primary',
            textTransform: 'none',
            gap: 1,
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha('primary.main', 0.05),
            },
            '&.Mui-disabled': {
              color: alpha('#64748B', 0.3),
              borderColor: alpha('#64748B', 0.1),
            },
          }}
        >
          {tool.icon}
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {tool.label}
          </Typography>
        </Button>
      ))}
    </Box>
  )
})
QuickTools.displayName = 'QuickTools'

// 底部状态栏
const BottomStatusBar = memo(() => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { version } = useClash()
  const { uptime } = useUptimeData()
  const {
    response: { data: connectionSummary },
  } = useConnectionSummaryData()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.3),
        border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary">
          YSCLUB v{version}
        </Typography>
        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3 }} />
        <Typography variant="caption" color="text.secondary">
          {t('home.components.traffic.metrics.activeConnections')}: {connectionSummary?.activeConnectionCount || 0}
        </Typography>
        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3 }} />
        <Typography variant="caption" color="text.secondary">
          Uptime: {formatUptime(uptime || 0)}
        </Typography>
      </Stack>
    </Box>
  )
})
BottomStatusBar.displayName = 'BottomStatusBar'

// 预加载首页卡片（兼容性导出）
export const preloadHomePageCards = () => Promise.resolve()

// ==================== 主页面 ====================

const HomePage = () => {
  return (
    <BasePage full contentStyle={{ padding: 0 }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          p: 3,
          boxSizing: 'border-box',
        }}
      >
        <Stack spacing={3} sx={{ maxWidth: 900, mx: 'auto' }}>
          {/* Banner */}
          <BannerSection />

          {/* 连接中心 */}
          <ConnectionHub />

          {/* 快速选择区域 */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              '& > *': { flex: '1 1 240px', minWidth: 240 },
            }}
          >
            <ModeSelector />
            <ProxySelector />
            <ProfileInfoCard />
          </Box>

          {/* 流量统计 */}
          <TrafficStatsSection />

          {/* 快捷工具 */}
          <QuickTools />

          {/* 底部状态 */}
          <BottomStatusBar />
        </Stack>
      </Box>
    </BasePage>
  )
}

export default HomePage
