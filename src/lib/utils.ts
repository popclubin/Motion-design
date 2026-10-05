import { type ClassValue, clsx } from 'clsx';

export function cx(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
