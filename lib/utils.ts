import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import util from 'util'

const logger = {
  info: (...args: any[]) => console.log('\x1b[36m%s\x1b[0m', '[INFO]', util.format(...args)),
  warn: (...args: any[]) => console.warn('\x1b[33m%s\x1b[0m', '[WARN]', util.format(...args)),
  error: (...args: any[]) => console.error('\x1b[31m%s\x1b[0m', '[ERROR]', util.format(...args)),
  debug: (...args: any[]) => console.log('\x1b[35m%s\x1b[0m', '[DEBUG]', util.format(...args)),
};

export default logger;