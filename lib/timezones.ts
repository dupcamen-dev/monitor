export interface TimezoneOption {
  value: string;
  label: string;
}

export const TIMEZONES: TimezoneOption[] = [
  { value: "Europe/Kyiv", label: "Europe/Kyiv (EET)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Europe/Warsaw", label: "Europe/Warsaw (CET/CEST)" },
  { value: "Europe/Helsinki", label: "Europe/Helsinki (EET/EEST)" },
  { value: "Europe/Istanbul", label: "Europe/Istanbul (TRT)" },
  { value: "Europe/Moscow", label: "Europe/Moscow (MSK)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },

  // United States
  { value: "America/New_York", label: "America/New_York (Eastern)" },
  { value: "America/Detroit", label: "America/Detroit (Eastern)" },
  { value: "America/Indiana/Indianapolis", label: "America/Indiana/Indianapolis (Eastern)" },
  { value: "America/Chicago", label: "America/Chicago (Central)" },
  { value: "America/Indiana/Knox", label: "America/Indiana/Knox (Central)" },
  { value: "America/Denver", label: "America/Denver (Mountain)" },
  { value: "America/Boise", label: "America/Boise (Mountain)" },
  { value: "America/Phoenix", label: "America/Phoenix (Mountain, no DST)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (Pacific)" },
  { value: "America/Juneau", label: "America/Juneau (Alaska)" },
  { value: "America/Anchorage", label: "America/Anchorage (Alaska)" },
  { value: "America/Adak", label: "America/Adak (Hawaii-Aleutian)" },
  { value: "Pacific/Honolulu", label: "Pacific/Honolulu (Hawaii)" },
  { value: "America/Puerto_Rico", label: "America/Puerto_Rico (Atlantic)" },
  { value: "America/St_Johns", label: "America/St_Johns (Newfoundland)" },

  // Canada
  { value: "America/Toronto", label: "America/Toronto (Eastern)" },
  { value: "America/Vancouver", label: "America/Vancouver (Pacific)" },
];

export const TIMEZONE_VALUES = TIMEZONES.map((tz) => tz.value);
