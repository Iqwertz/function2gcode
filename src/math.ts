import { MathArray } from "mathjs";
import { create, all, Matrix } from "mathjs";
import { Bounds, Plot } from ".";
import { Path } from "./render";

const config = {};
const math = create(all, config);

export interface PlotInterval {
  min: number;
  max: number;
  points: number;
}

export interface PlotData {
  x: number[];
  y: number[];
}

export function generatePlotPoints(plot: Plot): Plot {
  let yBounds: Bounds = { min: 0, max: 0 };
  for (let func of plot.functions) {
    let resolution = func.resolution ? func.resolution : plot.plotSettings.plotResolution;
    let x: number[] = createInterval(plot.plotSettings.xBounds.min, plot.plotSettings.xBounds.max, resolution);
    let y: number[] = calculateY(x, func.func);

    let funcYBounds: Bounds = {
      min: Math.min(...y),
      max: Math.max(...y),
    };

    if (funcYBounds.min < yBounds.min) {
      yBounds.min = funcYBounds.min;
    }
    if (funcYBounds.max > yBounds.max) {
      yBounds.max = funcYBounds.max;
    }

    func.plotPoints = { x: x, y: y };
  }

  if (!plot.plotSettings.yBounds) {
    plot.plotSettings.yBounds = yBounds;
  }

  return plot;
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

export function limitYValues(plot: Plot) {
  if (!plot.plotSettings.yBounds) {
    console.error("cant calculate function yBounds not defined");
    return;
  }
  let yBounds: Bounds = plot.plotSettings.yBounds;
  for (let func of plot.functions) {
    if (!func.path) {
      console.error("cant calculate function. Path not defined");
      continue;
    }
    let paths: Path[] = func.path;
    let limitedPaths: Path[] = [];
    let pathCounter = 0;
    for (let path of paths) {
      for (let i = 0; i < path.points.length; i++) {
        if (path.points[i][1] > yBounds.max || path.points[i][1] < yBounds.min) {
          if (limitedPaths[pathCounter]) {
            pathCounter++;
          }
        } else {
          if (!limitedPaths[pathCounter]) {
            limitedPaths[pathCounter] = { points: [] };
          }
          limitedPaths[pathCounter].points.push(path.points[i]);
        }
      }
    }
    func.path = limitedPaths;
  }
  return plot;
}
