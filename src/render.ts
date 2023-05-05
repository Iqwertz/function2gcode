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
  //x axis marks
  let xAxis: Path[] = [];
  for (let i = 0; i < style.dividerX; i++) {
    let xLength = Math.abs(xBounds.max - xBounds.min);
    xAxis.push({
      points: [
        [xBounds.min + i * (xLength / width), (-1 * style.dividerLength) / 2],
        [xBounds.min + i * (xLength / width), style.dividerLength / 2],
      ],
    });
  }

  //y axis marks
  if (!yBounds) {
    console.error("cant calculate function yBounds not defined");
    return;
  }
  let yAxis: Path[] = [];
  for (let i = 0; i < style.dividerY; i++) {
    let yLength = Math.abs(yBounds.max - yBounds.min);
    yAxis.push({
      points: [
        [(-1 * style.dividerLength) / 2, yBounds.min + i * (yLength / height)],
        [style.dividerLength / 2, yBounds.min + i * (yLength / height)],
      ],
    });
  }

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

  let scaleX = plot.plotSettings.height / Math.abs(plot.plotSettings.yBounds.max - plot.plotSettings.yBounds.min);
  let scaleY = plot.plotSettings.width / Math.abs(plot.plotSettings.xBounds.max - plot.plotSettings.xBounds.min);

  plot.axis = scalePath(plot.axis, scaleX, scaleY);

  for (let i = 0; i < plot.functions.length; i++) {
    if (plot.functions[i].path) {
      plot.functions[i].path = scalePath(plot.functions[i].path, scaleX, scaleY);
    }
  }
}

export function translatePath(path: Path, x: number, y: number): Path {
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
