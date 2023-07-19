import { ALLOWED_CHARACTERS_SET } from './constants';
import {
    anyNextWordsFormSwearWord,
    getCompletePathOfFile,
    getReplacementForSwearWord,
    readWordlist,
} from './utils';
import { VaryingString } from './varying_string';

export class Profanity {
    private CENSOR_WORDSET: any[] = [];
    private CHARS_MAPPING: Record<string, string[]> = {
        a: ['a', '@', '*', '4'],
        i: ['i', '*', 'l', '1'],
        o: ['o', '*', '0', '@'],
        u: ['u', '*', 'v'],
        v: ['v', '*', 'u'],
        l: ['l', '1'],
        e: ['e', '*', '3'],
        s: ['s', '$', '5'],
        t: ['t', '7'],
    };
    private MAX_NUMBER_COMBINATIONS = 1;
    private ALLOWED_CHARACTERS = [...ALLOWED_CHARACTERS_SET];
    private _defaultWordlistFilename = getCompletePathOfFile('profanity_wordlist.txt');

    constructor(words?: Iterable<string> | string) {
        if (
            words !== undefined &&
            !(typeof words === 'string' || Symbol.iterator in Object(words))
        ) {
            throw new TypeError('words must be of type string, Iterable, or undefined');
        }

        if (typeof words === 'string') {
            this.loadCensorWordsFromFile(words);
        } else {
            this.loadCensorWords(words);
        }
    }

    public censor(text: any, censorChar: string = '*'): string {
        if (typeof text !== 'string') {
            text = String(text);
        }

        if (typeof censorChar !== 'string') {
            censorChar = String(censorChar);
        }

        if (this.CENSOR_WORDSET.length === 0) {
            this.loadCensorWords();
        }

        return this._hideSwearWords(text, censorChar);
    }

    public loadCensorWordsFromFile(filename: string, options?: any): void {
        const words = readWordlist(filename);
        this._populateWordsToWordSet(words, options);
    }

    public loadCensorWords(customWords?: Iterable<string>, options?: any): void {
        customWords = customWords || readWordlist(this._defaultWordlistFilename);
        this._populateWordsToWordSet(customWords, options);
    }

    public addCensorWords(customWords: Iterable<string>): void {
        if (!Array.isArray(customWords) && !Set.prototype.isPrototypeOf(customWords)) {
            throw new TypeError('Function \'addCensorWords\' only accepts array or set.');
        }

        for (const word of customWords) {
            this.CENSOR_WORDSET.push(new VaryingString(word, this.CHARS_MAPPING));
        }
    }

    public containsProfanity(text: string): boolean {
        return text !== this.censor(text);
    }

    private _populateWordsToWordSet(words: Iterable<string>, options: any = {}): void {
        const whitelistWords: string[] = Array.isArray(options.whitelistWords)
            ? options.whitelistWords.map((word: string) => word.toLowerCase())
            : [];

        const allCensorWords: any[] = [];
        for (const word of new Set(words)) {
            const lowerCaseWord = word.toLowerCase();

            if (whitelistWords.includes(lowerCaseWord)) {
                continue;
            }

            const numNonAllowedChars = this._countNonAllowedCharacters(lowerCaseWord);
            this.MAX_NUMBER_COMBINATIONS = Math.max(this.MAX_NUMBER_COMBINATIONS, numNonAllowedChars);
            allCensorWords.push(new VaryingString(lowerCaseWord, this.CHARS_MAPPING));
        }

        this.CENSOR_WORDSET = allCensorWords;
    }

    private _countNonAllowedCharacters(word: string): number {
        let count = 0;
        for (const char of word) {
            if (!this.ALLOWED_CHARACTERS.includes(char)) {
                count++;
            }
        }
        return count;
    }

    private _updateNextWordsIndices(text: string, wordsIndices: [string, number][], startIdx: number): [string, number][] {
        if (wordsIndices.length === 0) {
            wordsIndices = this._getNextWords(text, startIdx, this.MAX_NUMBER_COMBINATIONS);
        } else {
            wordsIndices.splice(0, 2);
            if (wordsIndices.length && wordsIndices[wordsIndices.length - 1][0] !== '') {
                wordsIndices.push(...this._getNextWords(text, wordsIndices[wordsIndices.length - 1][1], 1));
            }
        }
        return wordsIndices;
    }

    private _hideSwearWords(text: string, censorChar: string): string {
        let censoredText = '';
        let curWord = '';
        let skipIndex = -1;
        let nextWordsIndices: [string, number][] = [];
        let startIdxOfNextWord = this._getStartIndexOfNextWord(text, 0);

        if (startIdxOfNextWord >= text.length - 1) {
            return text;
        }

        if (startIdxOfNextWord > 0) {
            censoredText = text.slice(0, startIdxOfNextWord);
            text = text.slice(startIdxOfNextWord);
        }

        for (let index = 0; index < text.length; index++) {
            if (index < skipIndex) {
                continue;
            }

            let char = text[index];
            if (this.ALLOWED_CHARACTERS.includes(char)) {
                curWord += char;
                continue;
            }

            if (curWord.trim() === '') {
                censoredText += char;
                curWord = '';
                continue;
            }

            nextWordsIndices = this._updateNextWordsIndices(text, nextWordsIndices, index);
            const [containsSwearWord, endIndex] = anyNextWordsFormSwearWord(
                curWord,
                nextWordsIndices,
                this.CENSOR_WORDSET
            );

            if (containsSwearWord) {
                curWord = getReplacementForSwearWord(censorChar);
                skipIndex = endIndex;
                char = '';
                nextWordsIndices = [];
            }

            for(const varyingString of this.CENSOR_WORDSET) {
                if(varyingString.equals(curWord.toLowerCase())){
                    curWord = getReplacementForSwearWord(censorChar);
                    break;
                }
            }
            // if (this.CENSOR_WORDSET.includes(curWord.toLowerCase())) {
            //     curWord = getReplacementForSwearWord(censorChar);
            // }

            censoredText += curWord + char;
            curWord = '';
        }

        if (curWord !== '' && skipIndex < text.length - 1) {
            for(const varyingString of this.CENSOR_WORDSET) {
                if(varyingString.equals(curWord.toLowerCase())){
                    curWord = getReplacementForSwearWord(censorChar);
                    break;
                }
            }
            // if (this.CENSOR_WORDSET.includes(curWord.toLowerCase())) {
            //     curWord = getReplacementForSwearWord(censorChar);
            // }
            censoredText += curWord;
        }

        return censoredText;
    }

    private _getStartIndexOfNextWord(text: string, startIdx: number): number {
        let startIdxOfNextWord = text.length;
        for (let index = startIdx; index < text.length; index++) {
            if (!this.ALLOWED_CHARACTERS.includes(text[index])) {
                continue;
            }
            startIdxOfNextWord = index;
            break;
        }
        return startIdxOfNextWord;
    }

    private _getNextWordAndEndIndex(text: string, startIdx: number): [string, number] {
        let nextWord = '';
        let endIndex = startIdx;
        for (let index = startIdx; index < text.length; index++) {
            const char = text[index];
            endIndex = index;
            if (this.ALLOWED_CHARACTERS.includes(char)) {
                nextWord += char;
                continue;
            }
            break;
        }
        return [nextWord, endIndex];
    }

    private _getNextWords(text: string, startIdx: number, numNextWords: number = 1): [string, number][] {
        const startIdxOfNextWord = this._getStartIndexOfNextWord(text, startIdx);
        if (startIdxOfNextWord >= text.length - 1) {
            return [['', startIdxOfNextWord], ['', startIdxOfNextWord]];
        }

        const [nextWord, endIdx] = this._getNextWordAndEndIndex(text, startIdxOfNextWord);
        const words: [string, number][] = [
            [nextWord, endIdx],
            [`${text.slice(startIdx, startIdxOfNextWord)}${nextWord}`, endIdx],
        ];

        if (numNextWords > 1) {
            words.push(...this._getNextWords(text, endIdx, numNextWords - 1));
        }

        return words;
    }
}
