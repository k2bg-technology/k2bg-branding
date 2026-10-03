import { type ClassValue, clsx } from 'clsx';
import { twMerge } from './extendTailwindMerge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
