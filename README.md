# word-decliner@1.0.7

[![Dependencies](https://img.shields.io/librariesio/release/npm/word-decliner/1.0.7)](https://libraries.io/npm/word-decliner/1.0.7)
[![Vulnerabilities](https://snyk.io/test/npm/word-decliner/1.0.7/badge.svg)](https://snyk.io/test/npm/word-decliner/1.0.7)
[![Install size](https://packagephobia.now.sh/badge?p=word-decliner@1.0.7)](https://packagephobia.now.sh/result?p=word-decliner@1.0.7)
[![NPM-version](https://img.shields.io/badge/npm-v1.0.7-blue.svg)](https://www.npmjs.com/package/word-decliner/v/1.0.7)
[![Total downloads](https://img.shields.io/npm/dt/word-decliner?label=total%20downloads)](https://npm-stat.com/charts.html?package=word-decliner)

Helps you to decline names or even phrases via Morpher service (http://morpher.ru/Demo.aspx) in three languages: Russian, Ukrainian and Kazakh.

## Installation
`word-decliner` is available via npm:
``` bash
$ npm i word-decliner@1.0.7
```

## Usage
According to http://morpher.ru/DemoUA.aspx?s=Микола%20Петренко
``` js
const wordDecliner = require('word-decliner');
// Or
const { uaDecliner } = require('word-decliner');

(async () => {
  console.log(await wordDecliner('ua', 'Микола Петренко'));
  // The same as
  console.log(await uaDecliner('Микола Петренко'));
  /*
    [
      { case: 'називний', value: 'Микола Петренко' },
      { case: 'родовий', value: 'Миколи Петренка' },
      { case: 'давальний', value: 'Миколі Петренку' },
      { case: 'знахідний', value: 'Миколу Петренка' },
      { case: 'орудний', value: 'Миколою Петренком' },
      { case: 'місцевий', value: 'Миколі Петренку' },
      { case: 'кличний', value: 'Миколо Петренку' },
    ]
  */
})();
```

Available language identifiers: **ru**, **ua**, **kz**.

### Taking exact case
According to:
- http://morpher.ru/Demo.aspx?s=Киев
- http://morpher.ru/DemoUA.aspx?s=Київ
- http://morpher.ru/DemoKZ.aspx?s=Киев

``` js
const wordDecliner = require('word-decliner');

(async () => {
  console.log(await wordDecliner('ru', 'Киев', 'именительный'));
  // { case: 'именительный', value: 'Киев', plural: 'Киевы' }
  console.log(await wordDecliner('ru', 'Киев', 'орудний'));
  // { case: 'творительный', value: 'Киевом', plural: 'Киевами' }
  console.log(await wordDecliner('ua', 'Київ', 'к'));
  // { case: 'кличний', value: 'Києве' }
  console.log(await wordDecliner('kz', 'Киев', 'жатыс'));
  /*
    {
      case: 'местный',
      kzCase: 'жатыс',
      'саны': [ 'Киевте', 'Киевтерде' ],
      'менiң': [ 'Киевімде', 'Киевтерімде' ],
      'сенiң': [ 'Киевіңде', 'Киевтеріңде' ],
      'сіздiң': [ 'Киевіңізде', 'Киевтеріңізде' ],
      'оның': [ 'Киевінде', 'Киевтерінде' ],
      'біздiң': [ 'Киевімізде', 'Киевтерімізде' ],
      'сендердiң': [ 'Киевтеріңде', 'Киевтеріңде' ],
      'сіздердiң': [ 'Киевтеріңізде', 'Киевтеріңізде' ],
      'олардың': [ 'Киевтерінде', 'Киевтерінде' ],
    }
  */
})();
```

### You can also conveniently destruct ruDecliner, uaDecliner and kzDecliner
``` js
const { ruDecliner, uaDecliner, kzDecliner } = require('word-decliner');

(async () => {
  console.log(await ruDecliner('ключ', 'д'));
  // { case: 'дательный', value: 'ключу', plural: 'ключам' }
  console.log(await uaDecliner('ключ', 'д'));
  // { case: 'давальний', value: 'ключу' }
  console.log(await kzDecliner('ключ', 'д'));
  /*
    {
      case: 'дательно-направительный',
      kzCase: 'барыс',
      'саны': [ 'ключке', 'ключтерге' ],
      'менiң': [ 'ключіме', 'ключтеріме' ],
      'сенiң': [ 'ключіңе', 'ключтеріңе' ],
      'сіздiң': [ 'ключіңізге', 'ключтеріңізге' ],
      'оның': [ 'ключіне', 'ключтеріне' ],
      'біздiң': [ 'ключімізге', 'ключтерімізге' ],
      'сендердiң': [ 'ключтеріңе', 'ключтеріңе' ],
      'сіздердiң': [ 'ключтеріңізге', 'ключтеріңізге' ],
      'олардың': [ 'ключтеріне', 'ключтеріне' ],
    }
  */
})();
```

### All requests are fully cached
``` js
const { uaDecliner } = require('word-decliner');
const elapsingTime = require('elapsing-time');

const timer = new elapsingTime();

(async () => {
  let res;

  timer.start();
  res = await uaDecliner('слово', 'дательный');
  timer.stop(true);
  console.log(res);
  timer.msPrint();    // Time: 263 ms

  timer.start();
  res = await uaDecliner('слово', 'знахідний');
  timer.stop(true);
  console.log(res);
  timer.msPrint();    // Time: 0 ms   // Almost instant invocation

  timer.start();
  res = await uaDecliner('слово');
  timer.stop(true);
  console.log(res);
  timer.msPrint();    // Time: 0 ms
})();
```

## Testing
No testing functionality provided.

---

Your improve suggestions and bug reports are welcome any time.
