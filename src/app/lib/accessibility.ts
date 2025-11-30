// Simplified accessibility helpers
export const ARIA_LABELS = {
  CLOSE: 'Cerrar',
  OPEN: 'Abrir',
  SEARCH: 'Buscar',
  MENU: 'Menú',
  EDIT: 'Editar',
  DELETE: 'Eliminar',
  SAVE: 'Guardar',
  CANCEL: 'Cancelar'
} as const;

export const SR_ONLY_CLASS = 'sr-only';

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function announceToScreenReader(message: string): void {
  if (typeof window === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export default {
  ARIA_LABELS,
  SR_ONLY_CLASS,
  generateId,
  announceToScreenReader
};