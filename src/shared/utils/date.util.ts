import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Initialize plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Set default timezone to Asia/Jakarta (GMT+7)
const DEFAULT_TIMEZONE = 'Asia/Jakarta';
dayjs.tz.setDefault(DEFAULT_TIMEZONE);

/**
 * Global Date Utility for Badalin Ecosystem
 * Standardizes all date operations to GMT+7 (Asia/Jakarta)
 */
export const dateUtil = (date?: dayjs.ConfigType) => {
  return dayjs(date).tz(DEFAULT_TIMEZONE);
};

export const parseAsJakarta = (date: string | Date, format?: string) => {
  if (format) {
    return dayjs.tz(date, format, DEFAULT_TIMEZONE);
  }
  return dayjs.tz(date, DEFAULT_TIMEZONE);
};

export const formatToJakarta = (date: dayjs.ConfigType, format: string = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).tz(DEFAULT_TIMEZONE).format(format);
};

export const getTodayJakarta = () => {
  return dayjs().tz(DEFAULT_TIMEZONE).startOf('day');
};

export { dayjs };
