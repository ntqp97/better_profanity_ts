import fs from 'fs';
import { getCompletePathOfFile } from './utils';

const ALLOWED_CHARACTERS = [];
ALLOWED_CHARACTERS.push(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
ALLOWED_CHARACTERS.push('@', '$', '*', '"', "'");

// Pre-load the unicode characters
const alphabeticUnicode = fs.readFileSync(getCompletePathOfFile('alphabetic_unicode.json'), 'utf-8');
ALLOWED_CHARACTERS.push(...JSON.parse(alphabeticUnicode));

export const ALLOWED_CHARACTERS_SET = new Set(ALLOWED_CHARACTERS);
