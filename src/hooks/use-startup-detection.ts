import { useEffect, useRef } from 'react'
import { getCurrentWindow, LogicalSize, currentMonitor } from '@tauri-apps/api/window'

import { hideInitialOverlay, updateOverlayProgress } from '@/pages/_layout/utils/initial-loading-overlay'

/**
 * useStartupDetection - 启动时屏幕环境检测与窗口自适应 Hook
 *
 * 在应用启动时执行分步检测流程，逐步更新加载进度条：
 * 1. 检测屏幕分辨率与 DPI 缩放
 * 2. 计算最优窗口尺寸
 * 3. 调整窗口大小（Tauri IPC）
 * 4. 计算内容缩放系数
 * 5. 等待页面布局稳定
 * 6. 隐藏加载层，展示主界面
 *
 * 每一步完成后更新进度条百分比和状态文字，让用户感知启动进度。
 */

const TITLEBAR_HEIGHT = 36
const BASEPAGE_HEADER_HEIGHT = 48
const PADDING = 24
const DESIGN_BASELINE_HEIGHT = 650
const MIN_SCALE = 0.72
const MAX_SCALE = 1.15
const MINIMAL_WIDTH = 520
const MINIMAL_HEIGHT = 520
const MAX_ADAPTIVE_WIDTH = 1180
const MAX_ADAPTIVE_HEIGHT = 860

interface DetectionStep {
  label: string
  weight: number
}

const STEPS: DetectionStep[] = [
  { label: '检测屏幕分辨率...', weight: 15 },
  { label: '计算最优窗口尺寸...', weight: 25 },
  { label: '调整窗口大小...', weight: 45 },
  { label: '优化界面缩放...', weight: 65 },
  { label: '加载首页组件...', weight: 85 },
  { label: '准备就绪', weight: 100 },
]

/** 计算分步进度 */
function stepProgress(stepIndex: number): number {
  return STEPS[Math.min(stepIndex, STEPS.length - 1)].weight
}

/** 延迟工具 */
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function useStartupDetection(themeReady: boolean) {
  const doneRef = useRef(false)

  useEffect(() => {
    if (!themeReady || doneRef.current) return
    doneRef.current = true

    let cancelled = false

    const run = async () => {
      try {
        // ===== Step 0: 检测屏幕分辨率与 DPI =====
        updateOverlayProgress(0, STEPS[0].label)
        await delay(200)
        if (cancelled) return

        let monitorInfo: {
          logicalW: number
          logicalH: number
          scale: number
        } | null = null

        try {
          const monitor = await currentMonitor()
          if (monitor) {
            const scale = monitor.scaleFactor
            const phys = monitor.size
            monitorInfo = {
              logicalW: phys.width / scale,
              logicalH: phys.height / scale,
              scale,
            }
          }
        } catch {
          // 非 Tauri 环境（浏览器预览）使用 window 数据
          monitorInfo = {
            logicalW: window.screen.width,
            logicalH: window.screen.height,
            scale: window.devicePixelRatio || 1,
          }
        }

        // ===== Step 1: 计算最优窗口尺寸 =====
        updateOverlayProgress(stepProgress(0), STEPS[1].label)
        await delay(300)
        if (cancelled) return

        let targetWidth = 940.0
        let targetHeight = 700.0

        if (monitorInfo) {
          targetWidth = Math.max(
            MINIMAL_WIDTH,
            Math.min(MAX_ADAPTIVE_WIDTH, monitorInfo.logicalW * 0.56),
          )
          targetHeight = Math.max(
            MINIMAL_HEIGHT,
            Math.min(MAX_ADAPTIVE_HEIGHT, monitorInfo.logicalH * 0.78),
          )
        }

        // ===== Step 2: 调整窗口大小 =====
        updateOverlayProgress(stepProgress(1), STEPS[2].label)
        await delay(200)
        if (cancelled) return

        try {
          const tauriWin = getCurrentWindow()
          await tauriWin.setSize(new LogicalSize(targetWidth, targetHeight))
          await tauriWin.center()
        } catch {
          // 非 Tauri 环境忽略
        }

        // ===== Step 3: 优化界面缩放 =====
        updateOverlayProgress(stepProgress(2), STEPS[3].label)
        await delay(300)
        if (cancelled) return

        const viewportHeight = window.innerHeight
        const availableHeight =
          viewportHeight - TITLEBAR_HEIGHT - BASEPAGE_HEADER_HEIGHT - PADDING
        const uiScale = Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, availableHeight / DESIGN_BASELINE_HEIGHT),
        )
        document.documentElement.style.setProperty(
          '--ui-scale',
          uiScale.toFixed(4),
        )

        // ===== Step 4: 等待页面布局稳定 =====
        updateOverlayProgress(stepProgress(3), STEPS[4].label)
        await delay(400)
        if (cancelled) return

        // 等待一帧确保 React 完成渲染
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        })

        // ===== Step 5: 准备就绪，隐藏加载层 =====
        updateOverlayProgress(stepProgress(4), STEPS[5].label)
        await delay(200)
        if (cancelled) return

        // 隐藏加载层
        const timer = hideInitialOverlay()

        // 清理定时器
        if (timer !== undefined) {
          // overlay 会在 200ms 后自动移除
        }
      } catch {
        // 出错时也要隐藏加载层，避免卡死
        hideInitialOverlay()
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [themeReady])
}
