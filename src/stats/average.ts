import { sum } from "ramda";

export const average = (arr: number[]) => sum(arr) / arr.length;
