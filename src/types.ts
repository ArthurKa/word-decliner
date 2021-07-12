import cheerio from 'cheerio';

export type CheerioRoot = ReturnType<typeof cheerio.load>;
export type Cheerio = ReturnType<CheerioRoot>;

export type Lang = 'ru' | 'ua' | 'kz';

export type IRuCase = (
  | { short: 'и'; full: 'именительный'; }
  | { short: 'р'; full: 'родительный'; }
  | { short: 'д'; full: 'дательный'; }
  | { short: 'в'; full: 'винительный'; }
  | { short: 'т'; full: 'творительный'; }
  | { short: 'п'; full: 'предложный'; }
  | { short: 'м'; full: 'местный'; }
);
export type RuDeclension = {
  case: IRuCase['full'];
  value: string;
  plural?: string;
};

export type IUaCase = (
  | { short: 'н'; full: 'називний'; }
  | { short: 'р'; full: 'родовий'; }
  | { short: 'д'; full: 'давальний'; }
  | { short: 'з'; full: 'знахідний'; }
  | { short: 'о'; full: 'орудний'; }
  | { short: 'м'; full: 'місцевий'; }
  | { short: 'к'; full: 'кличний'; }
);
export type UaDeclension = {
  case: IUaCase['full'];
  value: string;
  plural?: string;
};

export type IKzCase = (
  | { ru: 'именительный'; kz: 'атау'; }
  | { ru: 'родительный'; kz: 'ілік'; }
  | { ru: 'дательно-направительный'; kz: 'барыс'; }
  | { ru: 'винительный'; kz: 'табыс'; }
  | { ru: 'местный'; kz: 'жатыс'; }
  | { ru: 'исходный'; kz: 'шығыс'; }
  | { ru: 'творительный'; kz: 'көмектес'; }
);
export type KzNumber = 'саны' | 'менiң' | 'сенiң' | 'сіздiң' | 'оның' | 'біздiң' | 'сендердiң' | 'сіздердiң' | 'олардың';
export type IKzNumber = {
  [key in KzNumber]: [string, string];
}
export interface KzDeclension extends IKzNumber {
  case: IKzCase['ru'];
  kzCase: IKzCase['kz'];
}
export function isKzDeclansionArr(arr: any[]): arr is KzDeclension[] {
  return typeof arr?.[0].kzCase === 'string';
}

export type Case = (
  | IRuCase['full']
  | IRuCase['short']
  | IUaCase['full']
  | IUaCase['short']
  | IKzCase['ru']
  | IKzCase['kz']
);
