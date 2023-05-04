import { AxisStyle, Path, generateAxes, plot2Paths, plotPoints, scalePlot } from "./render";
import { paths2Gcode, saveGcode, GcodeSettings, renderPathsAsImage } from "./gcode";
import { PlotData, generatePlotPoints, limitYValues } from "./math";

export interface Plot {
  axisSettings: AxisStyle;
  plotSettings: PlotSettings;
  functions: PlotFunction[];
  axis: Path[];
}

export interface PlotSettings {
  width: number;
  height: number;
  xBounds: Bounds;
  yBounds?: Bounds;
  plotResolution: number;
}

export interface PlotFunction {
  func: string;
  style: string;
  plotPoints?: PlotData;
  path?: Path[];
  yBounds?: Bounds;
  resolution?: number;
}

export interface Bounds {
  min: number;
  max: number;
}

const testPlot: Plot = {
  axisSettings: {
    dividerX: 10,
    dividerY: 10,
    dividerLength: 1,
  },
  plotSettings: {
    height: 200,
    width: 200,
    plotResolution: 1000,
    xBounds: {
      min: -5,
      max: 10,
    },
    yBounds: {
      min: 0,
      max: 10,
    },
  },
  functions: [
    {
      func: "x^2",
      style: "",
    },
    {
      func: "sqrt(x)",
      style: "",
    },
    {
      func: "-x^2+4",
      style: "",
    },
    {
      func: "sin(x)",
      style: "",
    },
  ],
  axis: [],
};

const f: string = "x^2";

axesTest();

function axesTest() {
  let plotConfig: Plot = testPlot;
  generatePlotPoints(plotConfig);
  plotPoints(plotConfig);
  generateAxes(plotConfig);
  limitYValues(plotConfig);
  scalePlot(plotConfig);

  let allPaths = plot2Paths(plotConfig);

  let gcodeSettings: GcodeSettings = {
    feedRate: 1000,
    startGcode: "", //"$H\nG92X0Y0Z0\nF4000\nG21\nG90\nM05\nG4P0.5\n",
    endGcode: "M05 \nG4P0.5\nG01X0Y0",
    penUp: "M05\nG4P0.5\n",
    penDown: "M03S1000\nG4P0.5\n",
  };

  let gcode: string = paths2Gcode(allPaths, gcodeSettings);
  saveGcode(gcode, "axes.nc", gcodeSettings);
  renderPathsAsImage(allPaths, "axes.png");
}
