import { Bounds, Plot } from ".";
import { PlotData } from "./math";

export interface Path {
  points: number[][];
}

export interface AxisStyle {
  dividerX: number;
  dividerY: number;
  dividerLength: number;
}

export function plotPoints(plotConfig: Plot): Plot {
  for (let func of plotConfig.functions) {
    let graph: Path = { points: [] };

    if (func.plotPoints) {
      for (let i = 0; i < func.plotPoints.x.length; i++) {
        graph.points.push([func.plotPoints.x[i], func.plotPoints.y[i]]);
      }
    } else {
      console.error("Error function doesnt have plot points");
    }

    func.path = [graph];
  }
  return plotConfig;
}

export function generateAxes(plotConfig: Plot): Plot {
  let paths: Path[] = [];
  let xBounds = plotConfig.plotSettings.xBounds;
  let yBounds = plotConfig.plotSettings.yBounds;

  // x axis
  let xAxis: Path[] = [];
  xAxis.push({
    points: [
      [xBounds.min, 0],
      [xBounds.max, 0],
    ],
  });

  // y axis
  if (!yBounds) {
    console.error("cant calculate function yBounds not defined");
    return plotConfig;
  }

  let yAxis: Path[] = [];
  yAxis.push({
    points: [
      [0, yBounds?.min],
      [0, yBounds?.max],
    ],
  });

  if (xBounds.min > 0) {
    xAxis[0] = translatePath(xAxis[0], -xBounds.min, 0);
  }
  if (xBounds.max < 0) {
    xAxis[0] = translatePath(xAxis[0], -xBounds.max, 0);
  }
  if (yBounds.min > 0) {
    yAxis[0] = translatePath(yAxis[0], 0, -yBounds.min);
  }
  if (yBounds.max < 0) {
    yAxis[0] = translatePath(yAxis[0], 0, -yBounds.max);
  }

  paths = paths.concat(xAxis);
  paths = paths.concat(yAxis);

  plotConfig.axis = paths;

  return plotConfig;
}

export function generateTicks(plot: Plot) {
  let style: AxisStyle = plot.axisSettings;
  let width = plot.plotSettings.width;
  let height = plot.plotSettings.height;
  let xBounds = plot.plotSettings.xBounds;
  let yBounds = plot.plotSettings.yBounds;

  if (!yBounds) {
    console.error("cant calculate function yBounds not defined");
    return;
  }

  let xScale = height / 2 / Math.abs(yBounds.max - yBounds.min);
  let yScale = width / 2 / Math.abs(xBounds.max - xBounds.min);
  console.log(xScale, yScale);
  //x axis marks
  let xAxis: Path[] = [];
  let xAxisNegative: Path[] = [];
  let xAxisPositive: Path[] = [];
  for (let i = 1; i <= style.dividerX; i++) {
    let xLength = (Math.abs(xBounds.max - xBounds.min) * xScale) / style.dividerX;
    //Generate ticks in origin and spread them out
    if (i * xLength < xBounds.max * xScale) {
      xAxisPositive.push({
        points: [
          [i * xLength, (-1 * style.dividerLength) / 2],
          [i * xLength, style.dividerLength / 2],
        ],
      });
    }

    if (-1 * i * xLength > xBounds.min * xScale) {
      xAxisNegative.push({
        points: [
          [-1 * i * xLength, (-1 * style.dividerLength) / 2],
          [-1 * i * xLength, style.dividerLength / 2],
        ],
      });
    }
  }

  xAxis = xAxis.concat(xAxisNegative);
  xAxis = xAxis.concat(xAxisPositive);

  //y axis marks
  let yAxis: Path[] = [];
  let yAxisNegative: Path[] = [];
  let yAxisPositive: Path[] = [];
  for (let i = 1; i <= style.dividerY; i++) {
    let yLength = (Math.abs(yBounds.max - yBounds.min) * yScale) / style.dividerY;

    if (i * yLength < yBounds.max * yScale) {
      yAxisPositive.push({
        points: [
          [(-1 * style.dividerLength) / 2, i * yLength],
          [style.dividerLength / 2, i * yLength],
        ],
      });
    }

    if (-1 * i * yLength > yBounds.min * yScale) {
      yAxisNegative.push({
        points: [
          [(-1 * style.dividerLength) / 2, -1 * i * yLength],
          [style.dividerLength / 2, -1 * i * yLength],
        ],
      });
    }
  }

  yAxis = yAxis.concat(yAxisNegative);
  yAxis = yAxis.concat(yAxisPositive);

  plot.axis = plot.axis.concat(xAxis);
  plot.axis = plot.axis.concat(yAxis);
}

export function plot2Paths(plot: Plot): Path[] {
  let paths: Path[] = [];

  paths = paths.concat(plot.axis);

  for (let func of plot.functions) {
    if (func.path) {
      paths = paths.concat(func.path);
    }
  }

  return paths;
}

export function scalePlot(plot: Plot) {
  if (!plot.plotSettings.yBounds) {
    console.error("cant scale plot, yBounds not defined");
    return;
  }

  let scaleX = plot.plotSettings.height / 2 / Math.abs(plot.plotSettings.yBounds.max - plot.plotSettings.yBounds.min);
  let scaleY = plot.plotSettings.width / 2 / Math.abs(plot.plotSettings.xBounds.max - plot.plotSettings.xBounds.min);

  plot.axis = scalePath(plot.axis, scaleX, scaleY);

  for (let i = 0; i < plot.functions.length; i++) {
    let fPath: Path[] | undefined = plot.functions[i].path;
    if (fPath) {
      if (plot.plotSettings.xBounds.min > 0) {
        fPath = translatePath(fPath, -plot.plotSettings.xBounds.min, 0);
      }
      if (plot.plotSettings.xBounds.max < 0) {
        fPath = translatePath(fPath, -plot.plotSettings.xBounds.max, 0);
      }
      if (plot.plotSettings.yBounds.min > 0) {
        fPath = translatePath(fPath, 0, -plot.plotSettings.yBounds.min);
      }
      if (plot.plotSettings.yBounds.max < 0) {
        fPath = translatePath(fPath, 0, -plot.plotSettings.yBounds.max);
      }

      plot.functions[i].path = scalePath(fPath, scaleX, scaleY);
    }
  }
}

export function translatePath(path: Path[], x: number, y: number): Path[];
export function translatePath(path: Path, x: number, y: number): Path;
export function translatePath(path: Path | Path[], x: number, y: number) {
  if (Array.isArray(path)) {
    for (let i = 0; i < path.length; i++) {
      path[i] = translatePath(path[i], x, y);
    }
    return path;
  }

  let newPath: Path = {
    points: [],
  };
  path.points.forEach((point) => {
    newPath.points.push([point[0] + x, point[1] + y]);
  });
  return newPath;
}

function scalePath(path: Path[] | undefined, x: number, y: number): Path[] {
  if (!path) {
    return [];
  }
  let newPath: Path[] = [];
  for (let i = 0; i < path.length; i++) {
    newPath.push({ points: [] });
    path[i].points.forEach((point) => {
      newPath[i].points.push([point[0] * x, point[1] * y]);
    });
  }
  return newPath;
}
