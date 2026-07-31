import { Typography } from '@mui/material'
import React, { ReactNode } from 'react'

import { BaseErrorBoundary } from './base-error-boundary'

interface Props {
  title?: React.ReactNode // the page title
  header?: React.ReactNode // something behind title
  contentStyle?: React.CSSProperties
  children?: ReactNode
  full?: boolean
  noScroll?: boolean
}

export const BasePage: React.FC<Props> = (props) => {
  const { title, header, contentStyle, full, noScroll, children } = props

  return (
    <BaseErrorBoundary>
      <div className="base-page">
        <header
          data-tauri-drag-region="true"
          style={{
            userSelect: 'none',
            backgroundColor: '#0B101C',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#FFFFFF',
            }}
            data-tauri-drag-region="true"
          >
            {title}
          </Typography>

          {header}
        </header>

        <div
          className={full ? 'base-container no-padding' : 'base-container'}
          style={{ backgroundColor: '#0B101C' }}
        >
          <section
            style={{
              backgroundColor: '#0B101C',
              overflow: noScroll ? 'hidden' : undefined,
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
