import { MathArray } from "mathjs";
import { create, all, Matrix } from "mathjs";

const config = {};
const math = create(all, config);

export interface PlotInterval {
  min: number;
  max: number;
  points: number;
}

export interface Plot {
  x: number[];
  y: number[];
}

export function generatePlotPoints(f: string, plotInterval: PlotInterval): Plot {
  let x: number[] = createInterval(plotInterval.min, plotInterval.max, plotInterval.points);
  let y: number[] = calculateY(x, f);
  return { x, y };
}

//creates an array of numbers from min to max with size amount of evenly spaced intervals
export function createInterval(min: number, max: number, size: number): number[] {
  let interval: number[] = [];
  let step = (max - min) / size;
  for (let i = min; i < max; i += step) {
    interval.push(i);
  }
  return interval;
}

export function calculateY(x: number[], f: string): number[] {
  let y: number[] = [];
  for (let i = 0; i < x.length; i++) {
    y.push(math.evaluate(f, { x: x[i] }));
  }
  return y;
}
