import { memo, useMemo, useCallback, lazy, Suspense, useState, useEffect, useRef } from 'react'
import type { ComponentType, ReactNode } from 'react'

// =============== MEMOIZATION UTILITIES ===============

/**
 * Higher-order component for deep memoization
 */
export function deepMemo<T extends ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: any, nextProps: any) => boolean
): ComponentType<any> {
  const defaultAreEqual = (prevProps: any, nextProps: any) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps)
  }

  return memo(Component, areEqual || defaultAreEqual)
}

/**
 * Memoized selector for complex computations
 */
export function createSelector<TInput, TOutput>(
  selector: (input: TInput) => TOutput,
  equalityFn?: (a: TOutput, b: TOutput) => boolean
) {
  let lastInput: TInput
  let lastOutput: TOutput
  let hasRun = false

  const defaultEqualityFn = (a: TOutput, b: TOutput) => a === b

  return (input: TInput): TOutput => {
    if (!hasRun || !equalityFn?.(lastOutput, selector(input)) || 
        (!equalityFn && !defaultEqualityFn(lastOutput, selector(input)))) {
      lastInput = input
      lastOutput = selector(input)
      hasRun = true
    }
    return lastOutput
  }
}

// =============== LAZY LOADING UTILITIES ===============

/**
 * Creates a lazy-loaded component with error boundary
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn)
  
  return function LazyWrapper(props: any) {
    return React.createElement(
      Suspense,
      { fallback: fallback || React.createElement('div', {}, 'Cargando...') },
      React.createElement(LazyComponent, props)
    )
  }
}

/**
 * Preloads a lazy component
 */
export function preloadComponent(importFn: () => Promise<any>) {
  const componentImport = importFn()
  return componentImport
}

// =============== DEBOUNCE & THROTTLE HOOKS ===============

/**
 * Hook for debounced callbacks
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  return useCallback(
    debounce(callback, delay),
    [callback, delay]
  ) as T
}

/**
 * Hook for throttled callbacks
 */
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  return useCallback(
    throttle(callback, delay),
    [callback, delay]
  ) as T
}

// Utility functions
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null
  
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

function throttle<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let inThrottle = false
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => { inThrottle = false }, wait)
    }
  }) as T
}

// =============== VIRTUAL SCROLLING ===============

interface VirtualScrollConfig {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualScroll<T>(
  items: T[],
  config: VirtualScrollConfig
) {
  const { itemHeight, containerHeight, overscan = 5 } = config
  
  return useMemo(() => {
    const visibleItemsCount = Math.ceil(containerHeight / itemHeight)
    const totalItemsCount = items.length
    
    return {
      totalHeight: totalItemsCount * itemHeight,
      visibleItemsCount,
      getVisibleItems: (scrollTop: number) => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
        const endIndex = Math.min(
          totalItemsCount - 1,
          startIndex + visibleItemsCount + overscan * 2
        )
        
        return {
          startIndex,
          endIndex,
          items: items.slice(startIndex, endIndex + 1),
          offsetTop: startIndex * itemHeight
        }
      }
    }
  }, [items, itemHeight, containerHeight, overscan])
}

// =============== IMAGE OPTIMIZATION ===============

export function useLazyImage(src: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const image = new Image()
          image.onload = () => {
            setIsLoaded(true)
            img.src = src
          }
          image.onerror = () => setIsError(true)
          image.src = src
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(img)

    return () => observer.disconnect()
  }, [src])

  return { isLoaded, isError, imgRef }
}

// =============== PERFORMANCE MONITORING ===============

export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static startTiming(label: string): () => number {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      this.recordMetric(label, duration)
      return duration
    }
  }

  static recordMetric(label: string, value: number) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    
    const values = this.metrics.get(label)!
    values.push(value)
    
    // Keep only the last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  static getMetrics(label: string) {
    const values = this.metrics.get(label) || []
    if (values.length === 0) return null

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    return { avg, min, max, count: values.length }
  }

  static getAllMetrics() {
    const result: Record<string, any> = {}
    
    for (const [label, values] of this.metrics.entries()) {
      result[label] = this.getMetrics(label)
    }
    
    return result
  }

  static clearMetrics() {
    this.metrics.clear()
  }
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor(label: string) {
  const endTiming = useRef<(() => number) | null>(null)

  useEffect(() => {
    endTiming.current = PerformanceMonitor.startTiming(label)
    
    return () => {
      if (endTiming.current) {
        endTiming.current()
      }
    }
  }, [label])

  return {
    startTiming: () => {
      endTiming.current = PerformanceMonitor.startTiming(label)
    },
    endTiming: () => {
      if (endTiming.current) {
        return endTiming.current()
      }
      return 0
    }
  }
}

// =============== CACHE UTILITIES ===============

interface CacheOptions<T> {
  maxSize?: number
  ttl?: number // Time to live in milliseconds
  onEvict?: (key: string, value: T) => void
}

export class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>()
  private maxSize: number
  private ttl: number
  private onEvict?: (key: string, value: T) => void

  constructor(options: CacheOptions<T> = {}) {
    this.maxSize = options.maxSize || 100
    this.ttl = options.ttl || Infinity
    this.onEvict = options.onEvict
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    
    if (!item) return undefined
    
    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.delete(key)
      return undefined
    }
    
    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, item)
    
    return item.value
  }

  set(key: string, value: T): void {
    // Remove if already exists
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    // Remove oldest if at capacity
    else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value as string
      const oldestItem = this.cache.get(oldestKey)
      
      if (oldestItem && this.onEvict) {
        this.onEvict(oldestKey, oldestItem.value)
      }
      
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, { value, timestamp: Date.now() })
  }

  delete(key: string): boolean {
    const item = this.cache.get(key)
    
    if (item && this.onEvict) {
      this.onEvict(key, item.value)
    }
    
    return this.cache.delete(key)
  }

  clear(): void {
    if (this.onEvict) {
      for (const [key, item] of this.cache.entries()) {
        this.onEvict(key, item.value)
      }
    }
    
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

/**
 * Hook for LRU cache
 */
export function useCache<T>(options?: CacheOptions<T>) {
  const cache = useMemo(() => new LRUCache<T>(options), [options])
  
  const get = useCallback((key: string) => cache.get(key), [cache])
  const set = useCallback((key: string, value: T) => cache.set(key, value), [cache])
  const remove = useCallback((key: string) => cache.delete(key), [cache])
  const clear = useCallback(() => cache.clear(), [cache])
  
  return { get, set, remove, clear, size: cache.size() }
}

// =============== BUNDLE SPLITTING ===============

/**
 * Creates route-based code splitting
 */
export function createAsyncRoute(importFn: () => Promise<any>) {
  return lazy(() => 
    importFn().then(module => ({
      default: module.default || module
    }))
  )
}

// =============== WEB WORKERS ===============

export function createWebWorker(workerFunction: Function) {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: 'application/javascript'
  })
  
  return new Worker(URL.createObjectURL(blob))
}

/**
 * Hook for web worker
 */
export function useWebWorker<T, R>(
  workerFunction: (data: T) => R
) {
  const worker = useMemo(() => createWebWorker(workerFunction), [workerFunction])
  
  const postMessage = useCallback((data: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      const handleMessage = (event: MessageEvent) => {
        worker.removeEventListener('message', handleMessage)
        worker.removeEventListener('error', handleError)
        resolve(event.data)
      }
      
      const handleError = (error: ErrorEvent) => {
        worker.removeEventListener('message', handleMessage)
        worker.removeEventListener('error', handleError)
        reject(error)
      }
      
      worker.addEventListener('message', handleMessage)
      worker.addEventListener('error', handleError)
      worker.postMessage(data)
    })
  }, [worker])
  
  useEffect(() => {
    return () => worker.terminate()
  }, [worker])
  
  return { postMessage }
}

// Add React import for createElement
import * as React from 'react'