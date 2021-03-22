import axios from 'axios';
import cheerio from 'cheerio';
import TempObject from 'temp-object';
import { isObjectKey } from './utils';
import {
  Case,
  Cheerio,
  CheerioRoot,
  IRuCase,
  Lang,
  RuDeclension,
  UaDeclension,
  KzDeclension,
  KzNumber,
  IUaCase,
  isKzDeclansionArr,
} from './types';

const formUrl = (lang: Lang, phrase: string) => (
  `http://morpher.ru/Demo${lang === 'ru' ? '' : lang.toUpperCase()}.aspx?s=${phrase}`
);

const cases: Case[][] = [
  ['именительный', 'називний', 'и', 'н', 'атау'],
  ['родительный', 'родовий', 'р', 'ілік'],
  ['дательный', 'давальний', 'дательно-направительный', 'д', 'барыс'],
  ['винительный', 'знахідний', 'в', 'з', 'табыс'],
  ['творительный', 'орудний', 'т', 'о', 'көмектес'],
  ['предложный', 'п'],
  ['местный', 'місцевий', 'м', 'жатыс'],
  ['кличний', 'к'],
  ['исходный', 'шығыс'],
];

function chooseDeclension(declensionArr: RuDeclension[] | UaDeclension[] | KzDeclension[], chosenCase?: Case) {
  if(!chosenCase) {
    return declensionArr;
  }

  const loweCase = chosenCase.toLowerCase() as Case;
  const chosenCaseArr = cases.find(e => e.includes(loweCase)) || [loweCase];
  if(isKzDeclansionArr(declensionArr)) {
    return declensionArr.find(e => chosenCaseArr.includes(e.case) || chosenCaseArr.includes(e.kzCase as Case)) || null;
  } else {
    return (declensionArr as (RuDeclension | UaDeclension)[]).find(e => chosenCaseArr.includes(e.case)) || null;
  }
};

function getRuUa($: CheerioRoot) {
  const casesAccordance: Record<`${IRuCase['short']}:`, IRuCase['full']> = {
    'и:': 'именительный',
    'р:': 'родительный',
    'д:': 'дательный',
    'в:': 'винительный',
    'т:': 'творительный',
    'п:': 'предложный',
    'м:': 'местный',
  };

  const getCase = (caseName: `${IRuCase['short']}:` | IRuCase['full'] | IUaCase['full']) => {
    return isObjectKey(casesAccordance, caseName) ? casesAccordance[caseName] : caseName;
  };
  const get = (e: Cheerio, selector: string) => e.find(selector).text().trim();

  const selector = '#ctl00_ctl00_ctl00_BodyPlaceHolder_ContentPlaceHolder1_ContentPlaceHolder1_TABLE1 > tbody > tr';
  return $(selector)
    .toArray()
    .map(e => {
      const el = $(e);

      const caseName = (get(el, '> .case') || get(el, '> .question')).toLowerCase() as Parameters<typeof getCase>[0];
      const [value, plural = null] = el.find('> .answer').toArray().map(e => $(e).text().trim());

      return {
        case: getCase(caseName),
        value,
        ...plural && { plural },
      };
    })
    .filter(e => e.value !== undefined);
}
function getKz($: CheerioRoot): KzDeclension[] {
  const table = $('#ctl00_ctl00_ctl00_BodyPlaceHolder_ContentPlaceHolder1_ContentPlaceHolder1_DeclensionTable > tbody');

  const arr = [];
  const [kzCases, cases] = ([1, 2] as const)
    .map(n => table
      .find(`> tr:nth-child(${n}) > td`)
      .toArray()
      .slice(1)
      .map(e => $(e)
        .text()
        .trim()
        .toLowerCase()
      )
    ) as [string[], string[]];

  for(let i = 0; i < cases.length; i++) {
    const obj = {
      case: cases[i],
      kzCase: kzCases[i],
    } as KzDeclension;

    const rows = $('#ctl00_ctl00_ctl00_BodyPlaceHolder_ContentPlaceHolder1_ContentPlaceHolder1_DeclensionTable > tbody > tr').toArray().slice(2);

    for(let j = 0; j < rows.length; j += 2) {
      const key = j === 0 ? 'саны' : $(rows[j]).find('> td:first-child').text().trim().toLowerCase() as KzNumber;
      const value1 = $(rows[j]).find(`> td:nth-child(${i+2})`).text().trim();
      const value2 = $(rows[j+1]).find(`> td:nth-child(${i+2})`).text().trim();
      obj[key] = [value1, value2];
    }
    arr.push(obj);
  }

  return arr;
}

function getData(lang: 'ru'): ($: CheerioRoot) => RuDeclension[];
function getData(lang: 'ua'): ($: CheerioRoot) => UaDeclension[];
function getData(lang: 'kz'): ($: CheerioRoot) => KzDeclension[];

function getData(lang: Lang) {
  switch(lang) {
    case 'ru':
    case 'ua':
      return getRuUa;
    case 'kz':
      return getKz;
  }
};

const LANGS: Lang[] = ['ru', 'ua', 'kz'];

const cache = LANGS.reduce((obj, key) => {
  obj[key] = new TempObject();
  return obj;
}, {} as {
  ru: Record<string, RuDeclension[] | undefined>;
  ua: Record<string, UaDeclension[] | undefined>;
  kz: Record<string, KzDeclension[] | undefined>;
});

export default async function wordDecliner(langArg: 'ru', phrase: string): Promise<RuDeclension[]>;
export default async function wordDecliner(langArg: 'ru', phrase: string, chosenCase: Case): Promise<RuDeclension>;
export default async function wordDecliner(langArg: 'ua', phrase: string): Promise<UaDeclension[]>;
export default async function wordDecliner(langArg: 'ua', phrase: string, chosenCase: Case): Promise<UaDeclension>;
export default async function wordDecliner(langArg: 'kz', phrase: string): Promise<KzDeclension[]>;
export default async function wordDecliner(langArg: 'kz', phrase: string, chosenCase: Case): Promise<KzDeclension>;

export default async function wordDecliner(langArg: Lang, phrase: string, chosenCase?: Case) {
  const lang = String(langArg).toLowerCase() as Lang;
  if(!LANGS.includes(lang)) {
    const langs = LANGS.map(e => `'${e}'`).join(', ');
    throw new Error(`"${langArg}" is not one of supported languages: [${langs}]`);
  }

  const cachedValue = cache[lang][phrase];
  if(cachedValue) {
    return chooseDeclension(cachedValue, chosenCase);
  }

  const { data } = await axios(encodeURI(formUrl(lang, phrase)));
  const $ = cheerio.load(data, { decodeEntities: false });

  switch(lang) {
    case 'ru': {
      const cases = getData(lang)($);
      cache[lang][phrase] = cases;
      return chooseDeclension(cases, chosenCase);
    }
    case 'ua': {
      const cases = getData(lang)($);
      cache[lang][phrase] = cases;
      return chooseDeclension(cases, chosenCase);
    }
    case 'kz': {
      const cases = getData(lang)($);
      cache[lang][phrase] = cases;
      return chooseDeclension(cases, chosenCase);
    }
  }
}


type P = Parameters<typeof wordDecliner>;

export function ruDecliner(s: P[1], c: P[2]): Promise<RuDeclension>;
export function ruDecliner(s: P[1]): Promise<RuDeclension[]>;
export function ruDecliner(s: P[1], c?: P[2]) {
  return typeof c === 'undefined' ? wordDecliner('ru', s) : wordDecliner('ru', s, c);
}

export function uaDecliner(s: P[1], c: P[2]): Promise<UaDeclension>;
export function uaDecliner(s: P[1]): Promise<UaDeclension[]>;
export function uaDecliner(s: P[1], c?: P[2]) {
  return typeof c === 'undefined' ? wordDecliner('ua', s) : wordDecliner('ua', s, c);
}

export function kzDecliner(s: P[1], c: P[2]): Promise<KzDeclension>;
export function kzDecliner(s: P[1]): Promise<KzDeclension[]>;
export function kzDecliner(s: P[1], c?: P[2]) {
  return typeof c === 'undefined' ? wordDecliner('kz', s) : wordDecliner('kz', s, c);
}
