import { Bounds, Plot } from ".";
import fs from "fs";

export interface Path {
  points: number[][];
}

export interface AxisStyle {
  dividerX: number;
  dividerY: number;
  dividerLength: number;
  xLabel: string;
  yLabel: string;
}

export interface ArrowStyle {
  width: number;
  height: number;
  headWidth: number;
  headHeight: number;
}

let fontPoints = JSON.parse(fs.readFileSync("./src/fonts/HersheySans1.json", "utf8"));

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

  let yScale = height / 2 / Math.abs(yBounds.max - yBounds.min);
  let xScale = width / 2 / Math.abs(xBounds.max - xBounds.min);
  console.log(xScale, yScale);
  //x axis marks
  let xAxis: Path[] = [];
  let xAxisNegative: Path[] = [];
  let xAxisPositive: Path[] = [];

  let nXTicks = Math.pow(10, Math.round(Math.log10(Math.pow(2, style.dividerX))));
  for (let i = 1; i <= nXTicks; i++) {
    let tickSteps = Math.abs(xBounds.max - xBounds.min) / nXTicks;
    let xLength = tickSteps * xScale;
    //Generate ticks in origin and spread them out
    if (i * xLength < xBounds.max * xScale) {
      xAxisPositive.push({
        points: [
          [i * xLength, (-1 * style.dividerLength) / 2],
          [i * xLength, style.dividerLength / 2],
        ],
      });

      let tickPath = getPathsFromWord(Number((i * tickSteps).toFixed(2)).toString(), 1, "height");
      let tickLabel = tickPath[0];
      tickLabel = translatePath(
        tickLabel,
        i * xLength - tickPath[1].max / 2,
        (-1 * style.dividerLength) / 2 - tickPath[2].max
      );
      xAxisPositive = xAxisPositive.concat(tickLabel);
    }

    if (-1 * i * xLength > xBounds.min * xScale) {
      xAxisNegative.push({
        points: [
          [-1 * i * xLength, (-1 * style.dividerLength) / 2],
          [-1 * i * xLength, style.dividerLength / 2],
        ],
      });
      let tickPath = getPathsFromWord(Number((-1 * i * tickSteps).toFixed(2)).toString(), 1, "height");
      let tickLabel = tickPath[0];
      tickLabel = translatePath(
        tickLabel,
        -1 * i * xLength - tickPath[1].max / 2,
        (-1 * style.dividerLength) / 2 - tickPath[2].max
      );
      xAxisNegative = xAxisNegative.concat(tickLabel);
    }
  }

  xAxis = xAxis.concat(xAxisNegative);
  xAxis = xAxis.concat(xAxisPositive);

  //y axis marks
  let yAxis: Path[] = [];
  let yAxisNegative: Path[] = [];
  let yAxisPositive: Path[] = [];

  let nYTicks = Math.pow(10, Math.round(Math.log10(Math.pow(2, style.dividerY))));
  for (let i = 1; i <= nYTicks; i++) {
    let tickSteps = Math.abs(yBounds.max - yBounds.min) / nYTicks;
    let yLength = tickSteps * yScale;

    if (i * yLength < yBounds.max * yScale) {
      yAxisPositive.push({
        points: [
          [(-1 * style.dividerLength) / 2, i * yLength],
          [style.dividerLength / 2, i * yLength],
        ],
      });

      let tickPath = getPathsFromWord((i * tickSteps).toString(), 1, "height");
      let tickLabel = tickPath[0];
      tickLabel = translatePath(
        tickLabel,
        (-1 * style.dividerLength) / 2 - tickPath[1].max,
        i * yLength - tickPath[2].max / 2
      );
      yAxisPositive = yAxisPositive.concat(tickLabel);
    }

    if (-1 * i * yLength > yBounds.min * yScale) {
      yAxisNegative.push({
        points: [
          [(-1 * style.dividerLength) / 2, -1 * i * yLength],
          [style.dividerLength / 2, -1 * i * yLength],
        ],
      });

      let tickPath = getPathsFromWord((-1 * i * tickSteps).toString(), 1, "height");
      let tickLabel = tickPath[0];
      tickLabel = translatePath(
        tickLabel,
        (-1 * style.dividerLength) / 2 - tickPath[1].max,
        -1 * i * yLength - tickPath[2].max / 2
      );
      yAxisNegative = yAxisNegative.concat(tickLabel);
    }
  }

  yAxis = yAxis.concat(yAxisNegative);
  yAxis = yAxis.concat(yAxisPositive);

  plot.axis = plot.axis.concat(xAxis);
  plot.axis = plot.axis.concat(yAxis);

  //generate arrows
  let arrowStyle: ArrowStyle = {
    width: style.dividerLength,
    height: style.dividerLength,
    headWidth: style.dividerLength * 2,
    headHeight: style.dividerLength * 2,
  };

  let arrowX = getArrow(arrowStyle);
  arrowX = translatePath(arrowX, xBounds.max * xScale, 0);
  let arrowXNegative = getArrow(arrowStyle);
  arrowXNegative = rotatePath(arrowXNegative, Math.PI, "origin");
  arrowXNegative = translatePath(arrowXNegative, xBounds.min * xScale, 0);

  let arrowY = getArrow(arrowStyle);
  arrowY = rotatePath(arrowY, Math.PI / 2, "origin");
  arrowY = translatePath(arrowY, 0, yBounds.max * yScale);
  let arrowYNegative = getArrow(arrowStyle);
  arrowYNegative = rotatePath(arrowYNegative, -1 * (Math.PI / 2), "origin");
  arrowYNegative = translatePath(arrowYNegative, 0, yBounds.min * yScale);

  if (xBounds.min > 0) {
    arrowX = translatePath(arrowX, -xBounds.min * xScale, 0);
  }
  if (xBounds.max < 0) {
    arrowXNegative = translatePath(arrowXNegative, -xBounds.max * xScale, 0);
  }
  if (yBounds.min > 0) {
    arrowY = translatePath(arrowY, 0, -yBounds.min * yScale);
  }
  if (yBounds.max < 0) {
    arrowYNegative = translatePath(arrowYNegative, 0, -yBounds.max * yScale);
  }

  if (xBounds.max > 0) {
    plot.axis.push(arrowX);
  }
  if (xBounds.min < 0) {
    plot.axis.push(arrowXNegative);
  }
  if (yBounds.max > 0) {
    plot.axis.push(arrowY);
  }
  if (yBounds.min < 0) {
    plot.axis.push(arrowYNegative);
  }

  //generate axis labels
  let xLabelPos = xBounds.max > 0 ? xBounds.max : xBounds.min;
  let xLabel = getPathsFromWord(plot.axisSettings.xLabel, 2, "height");
  let xLabelGcode = translatePath(xLabel[0], xLabelPos * xScale + xLabel[1].max / 2, xLabel[2].max / 2);
  plot.axis = plot.axis.concat(xLabelGcode);

  let yLabelPos = yBounds.max > 0 ? yBounds.max : yBounds.min;
  let yLabel = getPathsFromWord(plot.axisSettings.yLabel, 2, "height");
  let yLabelGcode = translatePath(yLabel[0], yLabel[1].max / 2, yLabelPos * yScale + yLabel[2].max / 2);
  plot.axis = plot.axis.concat(yLabelGcode);
}

function getArrow(style: ArrowStyle): Path {
  let arrow: Path = {
    points: [
      [0, 0],
      [style.width, 0],
      [style.width, style.height / 2],
      [style.width + style.headWidth, 0],
      [style.width, (-1 * style.height) / 2],
      [style.width, 0],
    ],
  };

  return arrow;
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

  let scaleY = plot.plotSettings.height / 2 / Math.abs(plot.plotSettings.yBounds.max - plot.plotSettings.yBounds.min);
  let scaleX = plot.plotSettings.width / 2 / Math.abs(plot.plotSettings.xBounds.max - plot.plotSettings.xBounds.min);

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

export function getPathsFromWord(
  word: string,
  max: number,
  scaleBy: "width" | "height",
  letterSpacing?: number
): [Path[], Bounds, Bounds] {
  let paths: Path[] = [];

  letterSpacing = letterSpacing || 10;
  const letterHeight = fontPoints.settings.maxHeight;
  let wordWidth = 0;

  let letters = word.split("");
  let x = 0;
  for (let letter of letters) {
    let letterPaths = getPathFromLetter(letter);
    letterPaths = translatePath(letterPaths, x, 0);
    paths = paths.concat(letterPaths);
    let letterWidth = fontPoints[letter].bounds.width;
    wordWidth += Number(letterWidth) + letterSpacing;
    x += letterWidth + letterSpacing;
  }

  paths = flipPath("y", paths);

  let scale = max / (wordWidth * letters.length);

  if (scaleBy == "height") {
    scale = max / letterHeight;
  }

  paths = scalePath(paths, scale, scale);

  return [paths, { min: 0, max: wordWidth * scale }, { min: 0, max: letterHeight * scale }];
}

export function getPathFromLetter(letter: string): Path[] {
  let paths: Path[] = [];

  let segments = fontPoints[letter].paths;
  for (let segment of segments) {
    let path: Path = {
      points: [],
    };
    for (let point of segment.points) {
      //needs to be this explicit because there is no interface defined for the font
      path.points.push([point[0], point[1]]);
    }

    paths.push(path);
  }

  return paths;
}

//flips path along the x or y axis
export function flipPath(axis: "x" | "y", path: Path[]): Path[];
export function flipPath(axis: "x" | "y", path: Path): Path;
export function flipPath(axis: "x" | "y", path: Path | Path[]) {
  if (Array.isArray(path)) {
    for (let i = 0; i < path.length; i++) {
      path[i] = flipPath(axis, path[i]);
    }
    return path;
  }

  let newPath: Path = {
    points: [],
  };
  path.points.forEach((point) => {
    if (axis == "x") {
      newPath.points.push([-point[0], point[1]]);
    } else if (axis == "y") {
      newPath.points.push([point[0], -point[1]]);
    }
  });
  return newPath;
}

export function rotatePath(path: Path[], angle: number, rotationPoint: "center" | "origin"): Path[];
export function rotatePath(path: Path, angle: number, rotationPoint: "center" | "origin"): Path;
export function rotatePath(path: Path | Path[], angle: number, rotationPoint: "center" | "origin") {
  if (Array.isArray(path)) {
    for (let i = 0; i < path.length; i++) {
      path[i] = rotatePath(path[i], angle, rotationPoint);
    }
    return path;
  }

  let pathCenter = [0, 0];
  if (rotationPoint == "center") {
    pathCenter = getCenterOfPath(path);
  }

  let newPath: Path = {
    points: [],
  };
  path.points.forEach((point) => {
    newPath.points.push(rotatePoint(point, pathCenter, angle));
  });
  return newPath;
}

function getCenterOfPath(path: Path): number[] {
  let xBounds: Bounds = { min: Infinity, max: -Infinity };
  let yBounds: Bounds = { min: Infinity, max: -Infinity };

  for (let point of path.points) {
    if (point[0] < xBounds.min) {
      xBounds.min = point[0];
    }
    if (point[0] > xBounds.max) {
      xBounds.max = point[0];
    }
    if (point[1] < yBounds.min) {
      yBounds.min = point[1];
    }
    if (point[1] > yBounds.max) {
      yBounds.max = point[1];
    }
  }

  return [xBounds.min + (xBounds.max - xBounds.min) / 2, yBounds.min + (yBounds.max - yBounds.min) / 2];
}

function rotatePoint(point: number[], center: number[], angle: number): number[] {
  let x = point[0];
  let y = point[1];
  let cx = center[0];
  let cy = center[1];

  let rotatedX = Math.cos(angle) * (x - cx) - Math.sin(angle) * (y - cy) + cx;
  let rotatedY = Math.sin(angle) * (x - cx) + Math.cos(angle) * (y - cy) + cy;

  return [rotatedX, rotatedY];
}
