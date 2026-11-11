/**
 * Minimal type declarations for lunar-javascript (the package ships no types).
 * Only the members used by this project are declared.
 */
declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
    getFestivals(): string[];
    getOtherFestivals(): string[];
    toYmd(): string;
  }

  export class Lunar {
    getMonth(): number;
    getDay(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearInGanZhi(): string;
    getYearShengXiao(): string;
    getFestivals(): string[];
    getOtherFestivals(): string[];
    getJieQi(): string;
  }
}
