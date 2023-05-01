import { Plot } from "./math";

export interface Path {
  points: number[][];
}

export interface AxisStyle {
  dividerX: number;
  dividerY: number;
  dividerLength: number;
  bounds: PlotBounds;
}

export interface PlotBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export function plotPoints(plot: Plot, axisStyle: AxisStyle): Path {
  //hier weiter machen, es müssen die Punkte noch auf die richtige Größe skaliert werden und verschoben werden
  const width = 100;
  const height = 100; //toDO Make global

  let points: number[][] = [];

  for (let i = 0; i < plot.x.length; i++) {
    points.push([plot.x[i] * width, plot.y[i] * height]);
  }

  //shift points

  return { points: points };
}

export function generateAxes(style: AxisStyle): Path[] {
  let paths: Path[] = [];
  const width: number = 100; //toDO Make global
  const height: number = 100;

  // x axis
  let xAxis: Path[] = [];
  xAxis.push({
    points: [
      [0, 0],
      [width, 0],
    ],
  });
  //x axis marks
  for (let i = 0; i < style.dividerX; i++) {
    xAxis.push({
      points: [
        [i * (width / style.dividerX), (-1 * style.dividerLength) / 2],
        [i * (width / style.dividerX), style.dividerLength / 2],
      ],
    });
  }

  // y axis
  let yAxis: Path[] = [];
  yAxis.push({
    points: [
      [0, 0],
      [0, height],
    ],
  });
  //y axis marks
  for (let i = 0; i < style.dividerY; i++) {
    yAxis.push({
      points: [
        [(-1 * style.dividerLength) / 2, i * (height / style.dividerY)],
        [style.dividerLength / 2, i * (height / style.dividerY)],
      ],
    });
  }

  //transform origin to center
  if (style.bounds.xMin < 0 && style.bounds.xMax > 0) {
    let translateY = Math.abs(style.bounds.xMin) * (width / (style.bounds.xMax - style.bounds.xMin));
    xAxis = xAxis.map((path) => translatePath(path, 0, translateY));
  }

  if (style.bounds.yMin < 0 && style.bounds.yMax > 0) {
    let translateX = Math.abs(style.bounds.yMin) * (height / (style.bounds.yMax - style.bounds.yMin));
    yAxis = yAxis.map((path) => translatePath(path, translateX, 0));
  }

  paths = paths.concat(xAxis);
  paths = paths.concat(yAxis);

  return paths;
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
