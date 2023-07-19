type CharMap = Record<string, string[]>;

export class VaryingString {
  private _original: string;
  private _minLen: number;
  private _maxLen: number;
  private _charCombos: string[][];

  constructor(string: string, charMap: CharMap = {}) {
    this._original = string;
    this._minLen = 0;
    this._maxLen = 0;
    this._charCombos = [];

    for (const char of this._original) {
      if (char in charMap) {
        this._charCombos.push(charMap[char]);
        const lens = charMap[char].map((c) => c.length);
        this._minLen += Math.min(...lens);
        this._maxLen += Math.max(...lens);
      } else {
        this._charCombos.push([char]);
        this._minLen += 1;
        this._maxLen += 1;
      }
    }
  }

  toString(): string {
    return this._original;
  }

  equals(other: VaryingString | string): boolean {
    if (this === other) {
      return true;
    } else if (other instanceof VaryingString) {
      throw new Error('Comparison between VaryingString objects is not implemented yet.');
    } else if (typeof other === 'string') {
      const lenOther = other.length;
      if (lenOther < this._minLen || lenOther > this._maxLen) {
        return false;
      }

      let slices: string[] = [other];

      for (const chars of this._charCombos) {
        const newSlices: string[] = [];
        for (const char of chars) {
          if (!char) {
            newSlices.push(...slices);
          }
          const lenChar = char.length;
          for (const sl of slices) {
            if (sl.slice(0, lenChar) === char) {
              newSlices.push(sl.slice(lenChar));
            }
          }
        }
        if (newSlices.length === 0) {
          return false;
        }
        slices = newSlices;
      }

      for (const sl of slices) {
        if (sl.length === 0) {
          return true;
        }
      }

      return false;
    } else {
      return false;
    }
  }
}
