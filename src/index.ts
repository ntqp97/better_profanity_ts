import { Profanity } from './better_profanity'
import fs from 'fs';

function readCustomBadWords(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readFile('offensive_word_vi.txt', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                const customBadWords = data.trim().split('\n');
                resolve(customBadWords);
            }
        });
    });
}

async function main() {
    try {
        // const customBadWords: string[] = await readCustomBadWords();
        // const uniqueBadWords: Set<string> = new Set(customBadWords);
        // const profanity = new Profanity(uniqueBadWords)
        const profanity = new Profanity()
        console.log(profanity.censor('toi vui qua các bạn ơi hello fuck f*ck c4c'))
    } catch (error) {
        console.error('Error reading the file:', error);
    }
}

main();
