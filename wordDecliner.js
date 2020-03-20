'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const TempObject = require('temp-object');

const formUrl = (lang, phrase) => `http://morpher.ru/Demo${lang === 'ru' ? '' : lang.toUpperCase()}.aspx?s=${phrase}`;

const cases = [
  ['именительный', 'називний', 'и', 'н'],
  ['родительный', 'родовий', 'р'],
  ['дательный', 'давальний', 'дательно-направительный', 'д'],
  ['винительный', 'знахідний', 'в', 'з'],
  ['творительный', 'орудний', 'т', 'о'],
  ['предложный', 'п'],
  ['местный', 'місцевий', 'м'],
  ['кличний', 'к'],
  ['исходный'],
];
const chooseResult = (arr, chosenCase) => {
  if(!chosenCase) {
    return arr;
  }

  const cc = cases.find(e => e.includes(chosenCase.toLowerCase())) || [chosenCase.toLowerCase()];
  return arr.find(e => cc.includes(e.case) || cc.includes(e.kzCase)) || null;
};

function getRuUa($) {
  const cases = {
    'и:': 'именительный',
    'р:': 'родительный',
    'д:': 'дательный',
    'в:': 'винительный',
    'т:': 'творительный',
    'п:': 'предложный',
    'м:': 'местный',
  };
  const getCase = c => cases[c] || c;
  const get = (e, selector) => e.find(selector).text().trim();

  const selector = '#ctl00_ctl00_ctl00_BodyPlaceHolder_ContentPlaceHolder1_ContentPlaceHolder1_TABLE1 > tbody > tr';
  return $(selector).toArray().slice(3, -1).map(e => {
    const el = $(e);

    const caseName = (get(el, '> .case') || get(el, '> .question')).toLowerCase();
    const [value, plural = ''] = el.find('> .answer').toArray().map(e => $(e).text().trim());

    const obj = {
      case: getCase(caseName),
      value,
    };
    if(plural) {
      obj.plural = plural;
    }
    return obj;
  });
}
function getKz($) {
  const table = $('#ctl00_ctl00_ctl00_BodyPlaceHolder_ContentPlaceHolder1_ContentPlaceHolder1_DeclensionTable > tbody');

  const [kzCases, cases] = [1, 2].map(n => table.find(`> tr:nth-child(${n}) > td`).toArray().slice(1).map(e => $(e).text().trim().toLowerCase()));
  const arr = [];

  for(let i = 0; i < cases.length; i++) {
    const obj = {
      case: cases[i],
      kzCase: kzCases[i],
    };

    const rows = $('#ctl00_ctl00_ctl00_BodyPlaceHolder_ContentPlaceHolder1_ContentPlaceHolder1_DeclensionTable > tbody > tr').toArray().slice(2);
    for(let j = 0; j < rows.length; j += 2) {
      const key = j === 0 ? 'саны' : $(rows[j]).find('> td:first-child').text().trim().toLowerCase();
      const value1 = $(rows[j]).find(`> td:nth-child(${i+2})`).text().trim();
      const value2 = $(rows[j+1]).find(`> td:nth-child(${i+2})`).text().trim();
      obj[key] = [value1, value2];
    }
    arr.push(obj);
  }

  return arr;
}

const getData = {
  ru: getRuUa,
  ua: getRuUa,
  kz: getKz,
};

const cache = Object.keys(getData).reduce((obj, key) => (obj[key] = new TempObject(), obj), {});

async function wordDecliner(langArg, phrase, chosenCase = null) {
  const lang = String(langArg).toLowerCase();
  if(!Object.keys(getData).includes(lang)) {
    const langs = Object.keys(getData).map(e => `'${e}'`).join(', ');
    throw new Error(`"${langArg}" is not one of supported languages: [${langs}]`);
  }
  if(cache[lang][phrase]) {
    return chooseResult(cache[lang][phrase], chosenCase);
  }

  const { data } = await axios(encodeURI(formUrl(lang, phrase)));
  const $ = cheerio.load(data, { decodeEntities: false });
  const cases = getData[lang]($);
  cache[lang][phrase] = cases;

  return chooseResult(cases, chosenCase);
}

for(const key of Object.keys(getData)) {
  wordDecliner[`${key}Decliner`] = wordDecliner.bind(null, key);
}

module.exports = wordDecliner;
