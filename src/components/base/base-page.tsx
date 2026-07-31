import { Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import React, { ReactNode } from 'react'

import { BaseErrorBoundary } from './base-error-boundary'

interface Props {
  title?: React.ReactNode // the page title
  header?: React.ReactNode // something behind title
  contentStyle?: React.CSSProperties
  children?: ReactNode
  full?: boolean
}

export const BasePage: React.FC<Props> = (props) => {
  const { title, header, contentStyle, full, children } = props
  const theme = useTheme()

  const isDark = theme.palette.mode === 'dark'

  return (
    <BaseErrorBoundary>
      <div className="base-page">
        <header
          data-tauri-drag-region="true"
          style={{
            userSelect: 'none',
            backgroundColor: isDark ? '#0B101C' : '#ffffff',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 700,
              color: isDark ? '#FFFFFF' : '#000000',
            }}
            data-tauri-drag-region="true"
          >
            {title}
          </Typography>

          {header}
        </header>

        <div
          className={full ? 'base-container no-padding' : 'base-container'}
          style={{ backgroundColor: isDark ? '#0B101C' : '#ffffff' }}
        >
          <section
            style={{
              backgroundColor: isDark ? '#0B101C' : 'var(--background-color)',
            }}
          >
            <div className="base-content" style={contentStyle}>
              {children}
            </div>
          </section>
        </div>
      </div>
    </BaseErrorBoundary>
  )
}
