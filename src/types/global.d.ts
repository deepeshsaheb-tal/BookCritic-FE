// Type declarations for modules without TypeScript definitions

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Extend Window interface for service worker
interface Window {
  workbox: any;
  __WB_MANIFEST: Array<{
    revision: string;
    url: string;
  }>;
}

// Extend PerformanceNavigationTiming
interface PerformanceNavigationTiming extends PerformanceResourceTiming {
  domComplete: number;
  domContentLoadedEventEnd: number;
  domContentLoadedEventStart: number;
  domInteractive: number;
  loadEventEnd: number;
  loadEventStart: number;
  redirectCount: number;
  type: string;
  unloadEventEnd: number;
  unloadEventStart: number;
}

// Extend PerformanceObserver
interface PerformanceObserverInit {
  entryTypes: string[];
  type?: string;
  buffered?: boolean;
}

// Extend Navigator for sendBeacon
interface Navigator {
  sendBeacon(url: string, data?: BodyInit): boolean;
}
