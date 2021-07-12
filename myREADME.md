<header>

Helps you to decline words such as names, single or even combination of words via Morpher service located on http://morpher.ru/Demo.aspx in three available languages: Russian, Ukrainian and Kazakh.\
Maybe it works for some other languages, who knows.

<installation>

## Usage
According to http://morpher.ru/DemoUA.aspx?s=Микола%20Петренко
```ts
import wordDecliner, { uaDecliner } from './word-decliner/src';

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

```ts
import wordDecliner from './word-decliner/src';

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
```ts
import { ruDecliner, uaDecliner, kzDecliner } from './word-decliner/src';

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

### All requests are fully cached within 24 hours of the last use
```ts
import { uaDecliner } from './word-decliner/src';
import elapsingTime from './elapsing-time/src';

const wait = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

const timer = new elapsingTime();

(async () => {
  timer.start();
  const res1 = await uaDecliner('слово', 'дательный');
  timer.stop(true);
  console.log(res1); // { case: 'давальний', value: 'слову' }
  timer.msPrint();  // Time: 357.278 ms

  await wait(500);
  timer.start();
  const res2 = await uaDecliner('слово', 'знахідний');
  timer.stop(true);
  console.log(res2); // { case: 'знахідний', value: 'слово' }
  timer.msPrint();  // Time: 0.17 ms   // Almost instant invocation

  // await wait(24 * 3600 * 1000);  // Wait for 24 hours or more  // Too long to demonstrate
  timer.start();
  const res3 = await uaDecliner('слово');
  timer.stop(true);
  console.log(res3);
  timer.msPrint();  // Time: 319.122 ms  // Again not instant because of expired cache
  /*
    [
      { case: 'називний', value: 'слово' },
      { case: 'родовий', value: 'слова' },
      { case: 'давальний', value: 'слову' },
      { case: 'знахідний', value: 'слово' },
      { case: 'орудний', value: 'словом' },
      { case: 'місцевий', value: 'слові' },
      { case: 'кличний', value: 'слове' },
    ]
  */
})();
```

<noTesting>

<seeAlsoTitle>
- [decline-word](<npmjs-com>/package/decline-word)
- [elapsing-time](<npmjs-com>/package/elapsing-time)
- [temp-object](<npmjs-com>/package/temp-object)

<suggestions>
