import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core'
import {
  alpha,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from '@mui/material'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { useCallback } from 'react'
import { useMatch, useNavigate, useResolvedPath } from 'react-router'

import { useVerge } from '@/hooks/use-verge'

interface SortableProps {
  setNodeRef?: (element: HTMLElement | null) => void
  attributes?: DraggableAttributes
  listeners?: DraggableSyntheticListeners
  style?: CSSProperties
  isDragging?: boolean
  disabled?: boolean
}

interface Props {
  to: string
  children: string
  icon: ReactNode[]
  sortable?: SortableProps
  subtitle?: string
}

// Navigation label mapping: Chinese -> English subtitle
const NAV_SUBTITLES: Record<string, string> = {
  '首页': 'Dashboard',
  '代理': 'Proxy',
  '订阅': 'Subscription',
  '连接': 'Connection',
  '规则': 'Rules',
  '日志': 'Logs',
  '测试': 'Speed Test',
  '设置': 'Settings',
}

export const LayoutItem = (props: Props) => {
  const { to, children, icon, sortable, subtitle } = props
  const { verge } = useVerge()
  const { menu_icon } = verge ?? {}
  const navCollapsed = verge?.collapse_navbar ?? false
  const resolved = useResolvedPath(to)
  const match = useMatch({ path: resolved.pathname, end: true })
  const navigate = useNavigate()

  const effectiveMenuIcon =
    navCollapsed && menu_icon === 'disable' ? 'monochrome' : menu_icon

  const { setNodeRef, attributes, listeners, style, isDragging, disabled } =
    sortable ?? {}

  const draggable = Boolean(sortable) && !disabled
  const { onPointerDown, ...otherListeners } = draggable
    ? (listeners ?? {})
    : {}

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event)
    },
    [onPointerDown],
  )

  const navSubtitle = subtitle || NAV_SUBTITLES[children] || ''
  const isSelected = !!match

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={[
        {
          py: 0.5,
          maxWidth: 240,
          mx: 'auto',
          padding: '4px 0px',
          position: 'relative',
        },
        isDragging ? { opacity: 0.78 } : {},
      ]}
    >
      {/* Left blue glow bar for selected state */}
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '24px',
            borderRadius: '0 4px 4px 0',
            background: 'linear-gradient(180deg, #1677FF, #4F46E5)',
            boxShadow: '0 0 8px rgba(22, 119, 255, 0.6)',
            zIndex: 2,
          }}
        />
      )}

      <ListItemButton
        selected={isSelected}
        {...(draggable ? (attributes ?? {}) : {})}
        {...(draggable ? otherListeners : {})}
        sx={[
          {
            borderRadius: 2,
            marginLeft: 1.25,
            paddingLeft: 1,
            paddingRight: 1,
            marginRight: 1.25,
            cursor: draggable ? 'grab' : 'pointer',
            '&:active': draggable ? { cursor: 'grabbing' } : {},
            '& .MuiListItemText-primary': {
              color: 'text.primary',
              fontWeight: '500',
            },
            minHeight: 48,
          },
          isSelected
            ? {
                backgroundColor: 'rgba(22, 119, 255, 0.18) !important',
                '&:hover': {
                  backgroundColor: 'rgba(22, 119, 255, 0.22) !important',
                },
              }
            : {
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
                },
              },
        ]}
        title={navCollapsed ? children : undefined}
        aria-label={navCollapsed ? children : undefined}
        onPointerDown={handlePointerDown}
        onClick={() => navigate(to)}
      >
        {(effectiveMenuIcon === 'monochrome' || !effectiveMenuIcon) && (
          <ListItemIcon
            sx={{
              color: isSelected ? '#1677FF' : 'text.secondary',
              marginLeft: '6px',
              cursor: draggable ? 'grab' : 'inherit',
              minWidth: 36,
            }}
          >
            {icon[0]}
          </ListItemIcon>
        )}
        {effectiveMenuIcon === 'colorful' && (
          <ListItemIcon
            sx={{
              color: isSelected ? '#1677FF' : 'text.secondary',
              cursor: draggable ? 'grab' : 'inherit',
              minWidth: 36,
            }}
          >
            {icon[1]}
          </ListItemIcon>
        )}
        <ListItemText
          sx={{
            textAlign: 'left',
            marginLeft: effectiveMenuIcon === 'disable' ? '' : '-10px',
          }}
          primary={
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: 14,
                  color: isSelected ? '#FFFFFF' : '#94A3B8',
                  lineHeight: 1.3,
                }}
              >
                {children}
              </Typography>
              {!navCollapsed && navSubtitle && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    color: isSelected
                      ? 'rgba(22, 119, 255, 0.7)'
                      : 'rgba(148, 163, 184, 0.6)',
                    lineHeight: 1.2,
                    mt: '1px',
                    letterSpacing: '0.3px',
                  }}
                >
                  {navSubtitle}
                </Typography>
              )}
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  )
}
