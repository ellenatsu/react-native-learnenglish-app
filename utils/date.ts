import { toZonedTime, format } from "date-fns-tz"; // Import timezone functions

export const getLocalDate = () => {
    const timezone = 'Asia/Shanghai'; 
    const now = new Date();
    const localDate = toZonedTime(now, timezone); // Convert to specified timezone
    return format(localDate, 'yyyy-MM-dd'); // Format the date
  };
