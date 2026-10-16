/** One icon set, one stroke weight (1.5px), monochrome via currentColor. No emoji anywhere (design system). */
type P = { size?: number; className?: string };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });
export const SearchIcon = ({ size = 18, className }: P) => (<svg {...base(size)} className={className}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>);
export const MicIcon = ({ size = 16, className }: P) => (<svg {...base(size)} className={className}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
export const ClockIcon = ({ size = 16, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
export const PencilIcon = ({ size = 16, className }: P) => (<svg {...base(size)} className={className}><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" /></svg>);
export const CheckIcon = ({ size = 16, className }: P) => (<svg {...base(size)} className={className}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
