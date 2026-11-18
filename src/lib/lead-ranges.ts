// Added by Prachi, 2026-11-17: the dropdown choices of the pricing form (Business Requirements). [saved value, English label, Arabic label]
// The saved value is what goes into rv_demo_requests (branches_count / system_users_count / employees_count are text ranges now).
export const RANGES = {
  branches: [
    ['1', '1 branch', 'فرع واحد'], ['2-5', '2–5 branches', '2–5 فروع'], ['6-10', '6–10 branches', '6–10 فروع'],
    ['11-25', '11–25 branches', '11–25 فرعًا'], ['26+', '26+ branches', 'أكثر من 25 فرعًا'],
  ],
  system_users: [
    ['1', '1 user', 'مستخدم واحد'], ['2-5', '2–5 users', '2–5 مستخدمين'], ['6-10', '6–10 users', '6–10 مستخدمين'],
    ['11-25', '11–25 users', '11–25 مستخدمًا'], ['26-50', '26–50 users', '26–50 مستخدمًا'], ['51+', '51+ users', 'أكثر من 50 مستخدمًا'],
  ],
  employees: [
    ['1-10', '1–10 employees', '1–10 موظفين'], ['11-50', '11–50 employees', '11–50 موظفًا'], ['51-200', '51–200 employees', '51–200 موظف'],
    ['201-500', '201–500 employees', '201–500 موظف'], ['500+', '500+ employees', 'أكثر من 500 موظف'],
  ],
} as const;

export type RangeKey = keyof typeof RANGES;
export const rangeValues = (k: RangeKey): string[] => RANGES[k].map((r) => r[0]);