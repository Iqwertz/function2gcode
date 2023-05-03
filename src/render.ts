import { PlotData } from "./math";

export interface Path {
  points: number[][];
}

export interface AxisStyle {
  dividerX: number;
  dividerY: number;
  dividerLength: number;
}

export function plotPoints(plot: PlotData, axisStyle: AxisStyle): Path {
  //hier weiter machen, es müssen die Punkte noch auf die richtige Größe skaliert werden und verschoben werden
  const width = 100;
  const height = 100; //toDO Make global

  let graph: Path = { points: [] };

  for (let i = 0; i < plot.x.length; i++) {
    graph.points.push([plot.x[i], plot.y[i]]);
  }

  let scaleX = (axisStyle.bounds.xMax - axisStyle.bounds.xMin) / width;
  let scaleY = (axisStyle.bounds.yMax - axisStyle.bounds.yMin) / height;

  //graph = scalePath(graph, scaleY, scaleX);

  let translateX = 0;
  if (axisStyle.bounds.xMin < 0 && axisStyle.bounds.xMax > 0) {
    translateX = Math.abs(axisStyle.bounds.xMin) * (width / (axisStyle.bounds.xMax - axisStyle.bounds.xMin));
  }

  let translateY = 0;
  if (axisStyle.bounds.yMin < 0 && axisStyle.bounds.yMax > 0) {
    translateY = Math.abs(axisStyle.bounds.yMin) * (height / (axisStyle.bounds.yMax - axisStyle.bounds.yMin));
  }

  //graph = translatePath(graph, translateY, translateX);

  return graph;
}

export function generateAxes(style: AxisStyle): Path[] {
  let paths: Path[] = [];
  const width: number = 100; //toDO Make global
  const height: number = 100;

  // x axis
  let xAxis: Path[] = [];
  xAxis.push({
    points: [
      [style.bounds.xMin, 0],
      [style.bounds.xMax, 0],
    ],
  });
  //x axis marks
  for (let i = 0; i < style.dividerX; i++) {
    let xLength = Math.abs(style.bounds.xMax - style.bounds.xMin);
    xAxis.push({
      points: [
        [style.bounds.xMin + i * (xLength / style.dividerX), (-1 * style.dividerLength) / 2],
        [style.bounds.xMin + i * (xLength / style.dividerX), style.dividerLength / 2],
      ],
    });
  }

  // y axis
  let yAxis: Path[] = [];
  yAxis.push({
    points: [
      [0, style.bounds.yMin],
      [0, style.bounds.yMax],
    ],
  });
  //y axis marks
  for (let i = 0; i < style.dividerY; i++) {
    let yLength = Math.abs(style.bounds.yMax - style.bounds.yMin);
    yAxis.push({
      points: [
        [(-1 * style.dividerLength) / 2, style.bounds.yMin + i * (yLength / style.dividerY)],
        [style.dividerLength / 2, style.bounds.yMin + i * (yLength / style.dividerY)],
      ],
    });
  }

  //transform origin to center
  if (style.bounds.xMin < 0 && style.bounds.xMax > 0) {
    let translateY = Math.abs(style.bounds.xMin) * (width / (style.bounds.xMax - style.bounds.xMin));
    //xAxis = xAxis.map((path) => translatePath(path, 0, translateY));
  }

  if (style.bounds.yMin < 0 && style.bounds.yMax > 0) {
    let translateX = Math.abs(style.bounds.yMin) * (height / (style.bounds.yMax - style.bounds.yMin));
    //yAxis = yAxis.map((path) => translatePath(path, translateX, 0));
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

function scalePath(path: Path, x: number, y: number): Path {
  let newPath: Path = {
    points: [],
  };
  path.points.forEach((point) => {
    newPath.points.push([point[0] * x, point[1] * y]);
  });
  return newPath;
}
