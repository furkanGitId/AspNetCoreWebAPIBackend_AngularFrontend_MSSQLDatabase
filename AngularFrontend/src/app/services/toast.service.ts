// toast.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    if ('showToast' in (window as any)) {          // Web-standard toast
      (window as any).showToast({ text: message, duration: 4000, type });
    } else {                                       // fallback
      const t = document.createElement('div');
      t.style.cssText = `
        position:fixed; top:20px; right:20px; background:#323232;
        color:#fff; padding:14px 20px; border-radius:4px; z-index:9999;
        font-family:sans-serif; box-shadow:0 4px 8px rgba(0,0,0,.25);
      `;
      t.textContent = message;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 4000);
    }
  }
}