/** One icon set, one stroke weight (1.5px), monochrome via currentColor. No emoji anywhere (design system). */
type P = { size?: number; className?: string };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });
export const SearchIcon = ({ size = 18, className }: P) => (<svg {...base(size)} className={className}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>);
export const MicIcon = ({ size = 16, className }: P) => (<svg {...base(size)} className={className}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
export const ClockIcon = ({ size = 16, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
export const PencilIcon = ({ size = 16, className }: P) => (<svg {...base(size)} className={className}><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" /></svg>);
/** Category icons, keyed by category slug. A category with no icon here shows its first letter (design system rule). */
const CAT: Record<string, React.ReactNode> = {
  'accounting-invoicing': (<><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 15.5h7M9 19h4" /></>),
  erp: (<><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>),
  'hr-payroll': (<><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><circle cx="17.5" cy="15.5" r="3.5" /><path d="M17.5 14v3M16.2 15.5h2.6" /></>),
  crm: (<><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></>),
  'pos-restaurant': (<><path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M5.5 12.5V20h13v-7.5M10 20v-4.5h4V20" /></>),
  ecommerce: (<><path d="M3 4h2.5l2.2 10.5h9.6L19.5 8H6.4" /><circle cx="9.5" cy="19" r="1.4" /><circle cx="16.5" cy="19" r="1.4" /></>),
};
export const hasCategoryIcon = (slug: string) => slug in CAT;
export const CategoryIcon = ({ slug, size = 24, className }: P & { slug: string }) => (<svg {...base(size)} className={className}>{CAT[slug]}</svg>);
export const CheckIcon = ({ size = 16, className }: P) => (<svg {...base(size)} className={className}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
