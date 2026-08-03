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
 * 窗口尺寸策略：
 * - 基准 1100×960（逻辑像素），在 1920×1080 @ 100% 缩放下完整展示首页
 * - 最小不低于 1100×960
 * - 大屏按比例放大，上限 1400×1080
 * - DPI 缩放由 Tauri/OS 自动处理
 */

// 基准窗口尺寸：1920×1080 @ 100% 缩放下完整展示首页所有卡片
const BASE_WIDTH = 1100.0
const BASE_HEIGHT = 960.0

// 最小窗口尺寸（与 Rust 端一致）
const MIN_WIDTH = 1100.0
const MIN_HEIGHT = 960.0

// 最大窗口尺寸（大屏上限）
const MAX_WIDTH = 1400.0
const MAX_HEIGHT = 1080.0

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

        // 基准 1100×960，大屏按比例放大
        let targetWidth = BASE_WIDTH
        let targetHeight = BASE_HEIGHT

        if (monitorInfo) {
          const ratioW = monitorInfo.logicalW / 1920.0
          const ratioH = monitorInfo.logicalH / 1080.0
          // 大屏按比例放大（上限 1.3x），小屏保持基准 1.0x
          const ratio = Math.max(1.0, Math.min(ratioW, ratioH, 1.3))

          targetWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, BASE_WIDTH * ratio))
          targetHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, BASE_HEIGHT * ratio))
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
