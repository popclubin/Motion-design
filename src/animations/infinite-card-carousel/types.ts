export type PayStatusType = 'due' | 'paid' | 'overdue' | 'pending';
export type ButtonType = 'pay' | 'refresh' | 'paid';

export interface CardData {
  id: string;
  bankName: string;
  cardNo: string;
  name: string;
  amount: string;
  amountText: string;
  payStatus: string;
  payStatusType: PayStatusType;
  buttonType: ButtonType;
  buttonLabel?: string;
  bgImage: string;
  accentColor: string;
}

const ASSET_BASE = '/animations/infinite-card-carousel/cards';

export function getCardBgImage(bgImage: string): string {
  if (!bgImage) return `${ASSET_BASE}/POPcard_vertical.png`;
  if (bgImage.includes('pop') || bgImage.includes('POP')) return `${ASSET_BASE}/POPcard_vertical.png`;
  if (bgImage.includes('axis')) return `${ASSET_BASE}/axis_vertical.png`;
  if (bgImage.includes('icici')) return `${ASSET_BASE}/icici_vertical.png`;
  if (bgImage.includes('kotak')) return `${ASSET_BASE}/kotak_vertical.png`;
  if (bgImage.includes('hdfc')) return `${ASSET_BASE}/hdfc_vertical.png`;
  if (bgImage.includes('sbi')) return `${ASSET_BASE}/sbi_vertical.png`;
  return bgImage;
}

export const INITIAL_CARDS: CardData[] = [
  {
    id: 'card-pop-1',
    bankName: 'POP Club',
    cardNo: '.. 4019',
    name: 'Anushka Shah',
    amount: '',
    amountText: 'Exclusive POP Rewards Card',
    payStatus: 'Active',
    payStatusType: 'paid',
    buttonType: 'refresh',
    buttonLabel: 'Explore',
    bgImage: 'pop',
    accentColor: '#10b981',
  },
  {
    id: 'card-icici-2',
    bankName: 'ICICI Bank',
    cardNo: '.. 1590',
    name: 'Anushka Shah',
    amount: '₹42,000',
    amountText: 'You can save ₹30 with POPcoins',
    payStatus: 'Due in 7 days',
    payStatusType: 'due',
    buttonType: 'pay',
    buttonLabel: 'Pay',
    bgImage: 'icici',
    accentColor: '#c2410c',
  },
  {
    id: 'card-kotak-3',
    bankName: 'Kotak Mahindra',
    cardNo: '.. 1590',
    name: 'Anushka Shah',
    amount: '₹42,000',
    amountText: 'You can save ₹30 with POPcoins',
    payStatus: 'Due on 15 days',
    payStatusType: 'due',
    buttonType: 'pay',
    buttonLabel: 'Pay',
    bgImage: 'kotak',
    accentColor: '#b91c1c',
  },
  {
    id: 'card-hdfc-4',
    bankName: 'HDFC Bank',
    cardNo: '.. 1590',
    name: 'Anushka Shah',
    amount: '',
    amountText: '₹20,000 marked paid today',
    payStatus: 'Paid',
    payStatusType: 'paid',
    buttonType: 'refresh',
    buttonLabel: 'Refresh',
    bgImage: 'hdfc',
    accentColor: '#1d4ed8',
  },
  {
    id: 'card-sbi-5',
    bankName: 'SBI',
    cardNo: '.. 1590',
    name: 'Anushka Shah',
    amount: '',
    amountText: '₹20,000 marked paid today',
    payStatus: 'Paid',
    payStatusType: 'paid',
    buttonType: 'refresh',
    buttonLabel: 'Refresh',
    bgImage: 'sbi',
    accentColor: '#1e3a8a',
  },
  {
    id: 'card-axis-6',
    bankName: 'Axis Bank',
    cardNo: '.. 8821',
    name: 'Anushka Shah',
    amount: '₹18,500',
    amountText: 'You can save ₹25 with POPcoins',
    payStatus: 'Due in 12 days',
    payStatusType: 'due',
    buttonType: 'pay',
    buttonLabel: 'Pay',
    bgImage: 'axis',
    accentColor: '#9f1239',
  },
];
