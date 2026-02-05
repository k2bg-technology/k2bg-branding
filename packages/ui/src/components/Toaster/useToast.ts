import { toast as sonnerToast, type ToastT, useSonner } from 'sonner';

export function useToast(): {
  toasts: ToastT[];
  toast: typeof sonnerToast;
} {
  const { toasts } = useSonner();

  return {
    toasts,
    toast: sonnerToast,
  };
}
