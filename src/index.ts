import { AxisStyle, Path, generateAxes, plot2Paths, plotPoints } from "./render";
import { paths2Gcode, saveGcode, GcodeSettings, renderPathsAsImage } from "./gcode";
import { PlotData, generatePlotPoints } from "./math";

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
  ],
  axis: [],
};

const f: string = "x^2";

axesTest();

function axesTest() {
  let plotConfig: Plot = testPlot;
  plotConfig = generatePlotPoints(plotConfig);
  plotConfig = plotPoints(plotConfig);
  plotConfig = generateAxes(plotConfig);

  let allPaths = plot2Paths(plotConfig);

  let gcodeSettings: GcodeSettings = {
    feedRate: 1000,
    startGcode: "G28\nG90\nG1 Z5 F5000\nG1 X0 Y0 F5000\nG1 Z0 F5000\n",
    endGcode: "G1 Z5 F5000\nG28\n",
    penUp: "M03 S0\n",
    penDown: "M03 S100\n",
  };

  let gcode: string = paths2Gcode(allPaths, gcodeSettings);
  saveGcode(gcode, "axes.nc", gcodeSettings);
  renderPathsAsImage(allPaths, "axes.png");
}
