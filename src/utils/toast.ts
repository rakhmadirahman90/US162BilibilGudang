export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export function showToast(message: string, type: ToastType = 'success', duration = 3500) {
  const event = new CustomEvent('app-toast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
}

if (typeof window !== 'undefined') {
  (window as any).__showToast = showToast;
}
