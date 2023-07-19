import fs from 'fs';
import path from 'path';
import {VaryingString} from "./varying_string";

export function getCompletePathOfFile(filename: string): string {
  const root = path.resolve(__dirname);
  return path.join(root, filename);
}

export function* readWordlist(filename: string): Generator<string> {
  const wordlistFile = fs.readFileSync(filename, 'utf-8');
  const rows = wordlistFile.split('\n');
  for (const row of rows) {
    const trimmedRow = row.trim();
    if (trimmedRow !== '') {
      yield trimmedRow;
    }
  }
}

export function getReplacementForSwearWord(censorChar: string): string {
  return censorChar.repeat(4);
}

export function anyNextWordsFormSwearWord(
  curWord: string,
  wordsIndices: [string, number][],
  censorWords: VaryingString[]
): [boolean, number] {
  let fullWord = curWord.toLowerCase();
  let fullWordWithSeparators = curWord.toLowerCase();

  for (let index = 0; index < wordsIndices.length; index += 2) {
    const [singleWord, endIndex] = wordsIndices[index];
    const [wordWithSeparators] = wordsIndices[index + 1];

    if (singleWord === '') {
      continue;
    }

    fullWord += singleWord.toLowerCase();
    fullWordWithSeparators += wordWithSeparators.toLowerCase();

    for(const varyingString of censorWords) {
      if(varyingString.equals(fullWord) || varyingString.equals(fullWordWithSeparators)){
        return [true, endIndex];
      }
    }
    // if (censorWords.includes(fullWord) || censorWords.includes(fullWordWithSeparators)) {
    //   return [true, endIndex];
    // }
  }

  return [false, -1];
}
