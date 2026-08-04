import { Box, Typography, alpha, SvgIcon } from '@mui/material'
import { ArrowDownwardRounded, ArrowUpwardRounded, DonutLargeOutlined } from '@mui/icons-material'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { EnhancedCanvasTrafficGraph } from '@/components/home/enhanced-canvas-traffic-graph'
import { useTrafficData } from '@/hooks/use-traffic-data'
import { useVisibility } from '@/hooks/use-visibility'
import parseTraffic from '@/utils/parse-traffic'
import iconDark from '@/assets/image/icon_dark.svg?react'

/**
 * TrafficCard - 实时流量卡片
 *
 * 设计规格：
 * - 深色背景 #12192B
 * - 标题 "实时流量" + "TRAFFIC"
 * - 右上角：下载(蓝)/上传(绿)图例标签按钮
 * - 折线流量图表（蓝色下载曲线+渐变填充、绿色上传曲线+渐变填充、圆点采样节点）
 * - 数据面板：下载速度、上传速度、总流量
 */
const TrafficCard = memo(() => {
  const { t } = useTranslation()
  const pageVisible = useVisibility()
  const {
    response: { data: traffic },
  } = useTrafficData({ enabled: pageVisible })

  const [down, downUnit] = parseTraffic(traffic?.down || 0)
  const [up, upUnit] = parseTraffic(traffic?.up || 0)
  const [totalDown, totalDownUnit] = parseTraffic(traffic?.downTotal || 0)

  return (
    <Box
      sx={{
        height: '100%',
        p: 0.75,
        borderRadius: 2,
        background: '#12192B',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {/* 标题 + 右上角下载/上传图例 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SvgIcon
            component={iconDark}
            sx={{ width: 16, height: 16, flexShrink: 0, opacity: 0.9 }}
            inheritViewBox
          />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
              实时流量
            </Typography>
            <Typography sx={{ fontSize: 8, color: '#8A98B5', letterSpacing: '1px', fontWeight: 500 }}>
              TRAFFIC
            </Typography>
          </Box>
        </Box>
        {/* 下载/上传图例标签 */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.2,
              px: 0.5,
              py: 0.15,
              borderRadius: 0.75,
              bgcolor: alpha('#2378F5', 0.1),
              border: `1px solid ${alpha('#2378F5', 0.2)}`,
            }}
          >
            <ArrowDownwardRounded sx={{ fontSize: 10, color: '#2378F5' }} />
            <Typography sx={{ fontSize: 9, color: '#2378F5', fontWeight: 500 }}>
              下载
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.2,
              px: 0.5,
              py: 0.15,
              borderRadius: 0.75,
              bgcolor: alpha('#36D399', 0.1),
              border: `1px solid ${alpha('#36D399', 0.2)}`,
            }}
          >
            <ArrowUpwardRounded sx={{ fontSize: 10, color: '#36D399' }} />
            <Typography sx={{ fontSize: 9, color: '#36D399', fontWeight: 500 }}>
              上传
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 流量图 - flex:1 自适应高度 */}
      <Box
        sx={{
          flex: 1,
          minHeight: 38,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.03)',
        }}
      >
        <EnhancedCanvasTrafficGraph compact />
      </Box>

      {/* 数据面板 - 固定宽度防止数值变动导致布局位移 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: 0.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          height: 28,
          flexShrink: 0,
        }}
      >
        {/* 下载速度 */}
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3, mb: 0.15, minWidth: 0, overflow: 'hidden' }}>
            <ArrowDownwardRounded sx={{ fontSize: 12, color: '#2378F5', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
              {down} {downUnit}/s
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 8, color: '#8A98B5', whiteSpace: 'nowrap' }}>下载速度</Typography>
        </Box>

        {/* 上传速度 */}
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3, mb: 0.15, minWidth: 0, overflow: 'hidden' }}>
            <ArrowUpwardRounded sx={{ fontSize: 12, color: '#36D399', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
              {up} {upUnit}/s
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 8, color: '#8A98B5', whiteSpace: 'nowrap' }}>上传速度</Typography>
        </Box>

        {/* 总流量 */}
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3, mb: 0.15, minWidth: 0, overflow: 'hidden' }}>
            <DonutLargeOutlined sx={{ fontSize: 12, color: '#2378F5', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
              {totalDown} {totalDownUnit}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 8, color: '#8A98B5', whiteSpace: 'nowrap' }}>总流量</Typography>
        </Box>
      </Box>
    </Box>
  )
})

TrafficCard.displayName = 'TrafficCard'

export default TrafficCard
