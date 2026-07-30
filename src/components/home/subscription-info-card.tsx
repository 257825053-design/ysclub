import { Box, Button, LinearProgress, Typography, alpha } from '@mui/material'
import { FiberManualRecord, ListAltOutlined, GraphicEqOutlined, MenuOutlined } from '@mui/icons-material'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router'

import { useProfiles } from '@/hooks/use-profiles'
import { useSystemData } from '@/providers/app-data-context'
import parseTraffic from '@/utils/parse-traffic'

/** 从 URL 中提取主机名 */
const extractHostname = (url?: string): string => {
  if (!url) return '—'
  try {
    const u = new URL(url)
    return u.hostname
  } catch {
    const match = url.match(/^(?:https?:\/\/)?([^\/:?#]+)/)
    return match?.[1] || '—'
  }
}

/**
 * SubscriptionInfoCard - 订阅信息卡片（白底卡片）
 *
 * 设计规格（像素级还原）：
 * - 白底卡片 #FFFFFF，与其他深色卡片强烈区分
 * - 底层叠加低透明度浅淡蓝色网点世界地图水印
 * - 左上角圆形国旗 + 节点名 + 已连接/已断开标签 + 波形图标
 * - 右上角"订阅管理"蓝色描边按钮 + 三横线菜单图标
 * - 服务器地址、协议、更新时间、到期时间、流量使用（全部为变量）
 * - 底部进度条 + 百分比
 */
const SubscriptionInfoCard = memo(() => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { current } = useProfiles()
  const { sysproxy, runningMode } = useSystemData()

  const isConnected = sysproxy?.enable || runningMode === 'Service'

  // ========== 动态数据 ==========
  const serverHost = useMemo(() => extractHostname(current?.url), [current?.url])
  const updateTime = useMemo(() => {
    if (!current?.updated) return '—'
    // Handle both seconds (actual app) and milliseconds (preview mock)
    const ts = current.updated > 1e12 ? current.updated : current.updated * 1000
    return dayjs(ts).format('YYYY-MM-DD HH:mm')
  }, [current?.updated])
  const expireTime = useMemo(() => {
    if (!current?.extra?.expire) return '—'
    const ts = current.extra.expire > 1e12 ? current.extra.expire : current.extra.expire * 1000
    return dayjs(ts).format('YYYY-MM-DD')
  }, [current?.extra?.expire])
  const [used, usedUnit] = parseTraffic(current?.extra?.download || 0)
  const [total, totalUnit] = parseTraffic(current?.extra?.total || 0)
  const usagePercent = useMemo(() => {
    if (!current?.extra?.total || current.extra.total === 0) return 0
    return Math.min(100, Math.round((current.extra.download / current.extra.total) * 100))
  }, [current?.extra?.download, current?.extra?.total])
  const protocol = useMemo(() => {
    if (!current?.url) return '—'
    try {
      return new URL(current.url).protocol.replace(':', '').toUpperCase()
    } catch {
      return '—'
    }
  }, [current?.url])

  return (
    <Box
      sx={{
        position: 'relative',
        p: 1.5,
        borderRadius: 2.5,
        background: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflow: 'hidden',
      }}
    >
      {/* 右侧浅蓝色世界地图水印 */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          width: 160,
          height: 160,
          opacity: 0.06,
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='90' fill='none' stroke='%232176F4' stroke-width='2'/%3E%3Cellipse cx='100' cy='100' rx='90' ry='40' fill='none' stroke='%232176F4' stroke-width='1'/%3E%3Cellipse cx='100' cy='100' rx='90' ry='70' fill='none' stroke='%232176F4' stroke-width='1'/%3E%3Cline x1='10' y1='100' x2='190' y2='100' stroke='%232176F4' stroke-width='1'/%3E%3Cline x1='100' y1='10' x2='100' y2='190' stroke='%232176F4' stroke-width='1'/%3E%3C/svg%3E") center/contain no-repeat`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 头部：国旗 + 节点名 + 标签 + 波形 + 按钮 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* 圆形国旗图标 */}
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #B22234 0%, #B22234 46%, #FFFFFF 46%, #FFFFFF 54%, #3C3B6E 54%, #3C3B6E 100%)',
              border: '1px solid rgba(0,0,0,0.1)',
              flexShrink: 0,
            }}
          />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
            {current?.name || '—'}
          </Typography>
          {/* 连接状态标签 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.3,
              px: 0.75,
              py: 0.2,
              borderRadius: 1,
              bgcolor: isConnected ? alpha('#22C55E', 0.1) : alpha('#9CA3AF', 0.1),
            }}
          >
            <FiberManualRecord sx={{ fontSize: 6, color: isConnected ? '#22C55E' : '#9CA3AF' }} />
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: isConnected ? '#22C55E' : '#9CA3AF' }}>
              {isConnected ? '已连接' : '已断开'}
            </Typography>
          </Box>
          {/* 波形图标 - 仅连接时显示绿色 */}
          {isConnected && <GraphicEqOutlined sx={{ fontSize: 14, color: '#22C55E' }} />}
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ListAltOutlined sx={{ fontSize: 13 }} />}
          endIcon={<MenuOutlined sx={{ fontSize: 13 }} />}
          onClick={() => navigate('/profiles')}
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            borderColor: '#2176F4',
            color: '#2176F4',
            fontSize: 11,
            px: 1.2,
            py: 0.3,
            minWidth: 'auto',
            '&:hover': {
              borderColor: '#1A5FD4',
              bgcolor: alpha('#2176F4', 0.05),
            },
          }}
        >
          订阅管理
        </Button>
      </Box>

      {/* 信息列表 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, position: 'relative', zIndex: 1 }}>
        {[
          { label: '服务器地址', value: serverHost },
          { label: '协议', value: protocol },
          { label: '更新时间', value: updateTime },
          { label: '到期时间', value: expireTime },
          { label: '已使用 / 总量', value: `${used} ${usedUnit} / ${total} ${totalUnit}` },
        ].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
              {item.label}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#1A1A1A', fontWeight: 500, fontFamily: 'monospace' }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 进度条 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
        <Typography sx={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>
          使用进度
        </Typography>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={usagePercent}
            sx={{
              height: 5,
              borderRadius: 3,
              bgcolor: '#F3F4F6',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #93C5FD, #2176F4)',
              },
            }}
          />
        </Box>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', minWidth: 32, textAlign: 'right' }}>
          {usagePercent}%
        </Typography>
      </Box>
    </Box>
  )
})

SubscriptionInfoCard.displayName = 'SubscriptionInfoCard'

export default SubscriptionInfoCard
