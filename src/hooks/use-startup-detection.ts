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
 * 4. 等待页面布局稳定，通知 React 重新计算布局
 * 5. 隐藏加载层，展示主界面
 *
 * 关键改进：
 * - 窗口尺寸调整后，主动派发 resize 事件，触发 useWindowMode 重新计算密度模式
 * - 不再使用 --ui-scale CSS 变量做全局缩放，改由 flexbox + useWindowMode 自适应
 * - 等待两帧确保 React 完成重渲染后再隐藏加载层
 */

const TITLEBAR_HEIGHT = 36
const MINIMAL_WIDTH = 520
const MINIMAL_HEIGHT = 520
const MAX_ADAPTIVE_WIDTH = 1180
const MAX_ADAPTIVE_HEIGHT = 860

interface DetectionStep {
  label: string
  weight: number
}

const STEPS: DetectionStep[] = [
  { label: '初始化云山俱乐部', weight: 15 },
  { label: '检测设备环境', weight: 30 },
  { label: '调整窗口尺寸', weight: 50 },
  { label: '优化显示方案', weight: 75 },
  { label: '加载网络模块', weight: 90 },
  { label: '进入YSCLUB', weight: 100 },
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

        // ===== Step 3: 通知 React 重新计算布局 =====
        updateOverlayProgress(stepProgress(2), STEPS[3].label)
        await delay(300)
        if (cancelled) return

        // 主动派发 resize 事件，触发 useWindowMode 重新计算密度模式
        // 这是关键步骤：窗口尺寸改变后，必须通知 React 重新计算布局
        window.dispatchEvent(new Event('resize'))

        // ===== Step 4: 等待页面布局稳定 =====
        updateOverlayProgress(stepProgress(3), STEPS[4].label)
        await delay(400)
        if (cancelled) return

        // 等待两帧确保 React 完成重渲染（useWindowMode 更新 → 组件重绘）
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        })

        // 再次派发 resize，确保最终布局稳定
        window.dispatchEvent(new Event('resize'))

        // 再等待一帧让二次渲染完成
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        })

        // ===== Step 5: 准备就绪，隐藏加载层 =====
        updateOverlayProgress(stepProgress(4), STEPS[5].label)
        await delay(200)
        if (cancelled) return

        // 隐藏加载层
        hideInitialOverlay()
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
