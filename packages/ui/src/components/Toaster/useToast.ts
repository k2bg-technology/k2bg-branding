import { useSonner, toast as sonnerToast, type ToastT } from 'sonner';

export default function useToast(): {
  toasts: ToastT[];
  toast: typeof sonnerToast;
} {
  const { toasts } = useSonner();

  return {
    toasts,
    toast: sonnerToast,
  };
}
