# better_profanity
*Blazingly fast cleaning swear words (and their leetspeak) in strings*

Currently, the library has set up default filtering for profanity in both **English** and **Vietnamese** languages

[![version](https://img.shields.io/npm/v/better_profanity_ts)](https://www.npmjs.com/package/better_profanity_ts)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?style=popout)](https://github.com/ntqp97/better_profanity_ts/blob/master/LICENSE)

Inspired from package profanity of Ben Friedland, this library is significantly faster than the original one, by using string comparison instead of regex.

Inspired by a package [better_profanity](https://github.com/snguyenthanh/better_profanity) of [Son Thanh Nguyen](https://github.com/snguyenthanh), This library is a version designed for Node.js.

It supports [modified spellings](https://en.wikipedia.org/wiki/Leet) (such as `p0rn`, `h4NDjob`, `handj0b` and `b*tCh`).

## Installation

npm i -D better_profanity_ts

## Unicode characters

Only Unicode characters from categories `Ll`, `Lu`, `Mc` and `Mn` are added. More on Unicode categories can be found [here][unicode category link].

[unicode category link]: https://en.wikipedia.org/wiki/Template:General_Category_(Unicode)

Not all languages are supported yet, such as *Chinese*.

## Usage

```Typescript
import { Profanity } from 'better_profanity_ts/lib/better_profanity'

async function main() {
  const profanity = new Profanity()
  const text = "You p1ec3 of sHit. Ban nhu con c4c"
  console.log(profanity.censor(text))
 # You p1ec3 of ****. Ban nhu con ****
}
```

All modified spellings of words in [profanity_wordlist.txt](./src/profanity_wordlist.txt) will be generated. For example, the word `handjob` would be loaded into:

```typescript
'handjob', 'handj*b', 'handj0b', 'handj@b', 'h@ndjob', 'h@ndj*b', 'h@ndj0b', 'h@ndj@b',
'h*ndjob', 'h*ndj*b', 'h*ndj0b', 'h*ndj@b', 'h4ndjob', 'h4ndj*b', 'h4ndj0b', 'h4ndj@b'
```

The full mapping of the library can be found in [better_profanity.ts](./src/better_profanity.ts#L13-L21).

## 1. Censor swear words from a text

By default, `profanity` replaces each swear words with 4 asterisks `****`.

```typescript
import { Profanity } from 'better_profanity_ts/lib/better_profanity'

async function main() {
    const profanity = new Profanity()
    const text = "You p1ec3 of sHit. Ban nhu con c4c"
    console.log(profanity.censor(text))
    # You p1ec3 of ****. Ban nhu con ****
}
```
# 2. Censor doesn't care about word dividers

The function `.censor()` also hides words separated not just by an empty space ` ` but also other dividers, such as `_`, `,` and `.`. Except for `@, $, *, ", '`.

```typescript
import { Profanity } from 'better_profanity_ts/lib/better_profanity'

async function main() {
    const profanity = new Profanity()
    const text = "...sh1t...hello_cat_fuck,,,,123"
    console.log(profanity.censor(text))
    # ...****...hello_cat_****,,,,123
}
```
### 3. Censor swear words with custom character

4 instances of the character in the second parameter in `.censor()` will be used to replace the swear words.

```typescript
import { Profanity } from 'better_profanity_ts/lib/better_profanity'

async function main() {
    const profanity = new Profanity()
    const text = "...sh1t...hello_cat_fuck,,,,123"
    console.log(profanity.censor(text, '-'))
    # ...----...hello_cat_----,,,,123
}
```

### 4. Check if the string contains any swear words

Function `.containsProfanity()` return `True` if any words in the given string has a word existing in the wordlist.

```typescript
import { Profanity } from 'better_profanity_ts/lib/better_profanity'

async function main() {
    const profanity = new Profanity()
    const text = "...sh1t...hello_cat_fuck,,,,123"
    console.log(profanity.containsProfanity(text))
    # true
}
```

### 5. Censor swear words with a custom wordlist

#### 5.1. Wordlist as a `List`

Function `loadCensorWords` takes a `List` of strings as censored words.
The provided list will replace the default wordlist.

```typescript
import { Profanity } from 'better_profanity_ts/lib/better_profanity'

async function main() {
    const profanity = new Profanity()
    const customBadwords: string[] = ['happy', 'jolly', 'merry'];
    profanity.loadCensorWords(customBadwords);
    console.log(profanity.censor("Have a merry day!"));
    # **** a **** day
}
```
#### 5.2. Wordlist as a file

Function `loadCensorWordsFromFile takes a filename, which is a text file and each word is separated by lines.

```typescript
import { Profanity } from 'better_profanity_ts/lib/better_profanity'

async function main() {
    const profanity = new Profanity()
    profanity.loadCensorWordsFromFile('/path/to/my/project/my_wordlist.txt');
    console.log(profanity.censor("Have a merry day!"));
    # **** a **** day
}
```

### 6. Whitelist

Functions `loadCensorWords` and `loadCensorWordsFromFile` take a keyword argument `whitelistWords` to ignore words in a wordlist.

It is best used when there are only a few words that you would like to ignore in the wordlist.

```typescript
# Use the default wordlist
const options = { whitelistWords: ['happy', 'merry'] };
profanity.loadCensorWords([], options)

# or with your custom words as a List
const customBadWords: string[] = ['happy', 'jolly', 'merry']
profanity.loadCensorWords(custom_badwords, options)

# or with your custom words as a text file
profanity.loadCensorWordsFromFile('/path/to/my/project/my_wordlist.txt', options)
```

### 7. Add more censored words

```typescript
import { Profanity } from 'better_profanity_ts/lib/better_profanity'

async function main() {
    const profanity = new Profanity()
    const customBadWords: string[] = ['happy', 'jolly', 'merry']
    profanity.addCensorWords(customBadWords);
    console.log(profanity.censor("Happy you, fuck!"));
    # **** you, ****!
}
```
## Contributing

Please read for details on our code, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
