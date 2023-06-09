import { AxisStyle, Path, generateAxes, generateTicks, plot2Paths, plotPoints, scalePlot } from "./render";
import { saveGcode, GcodeSettings, renderPathsAsImage, plot2Gcode } from "./gcode";
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
    dividerX: 3,
    dividerY: 3,
    dividerLength: 1,
    xLabel: "t",
    yLabel: "y(t)",
  },
  plotSettings: {
    height: 100,
    width: 100,
    plotResolution: 100,
    xBounds: {
      min: -5,
      max: 5,
    },
    /*   yBounds: {
      min: -10,
      max: 10,
    }, */
  },
  functions: [
    {
      func: "x^(3)",
      style: "",
    },
    /* {
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
      func: "4sin(x)",
      style: "",
    }, */
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
  generateTicks(plotConfig);

  let allPaths = plot2Paths(plotConfig);

  let gcodeSettings: GcodeSettings = {
    feedRate: 1000,
    startGcode: "", //"$H\nG92X0Y0Z0\nF4000\nG21\nG90\nM05\nG4P0.5\n",
    endGcode: "M05 \nG4P0.5\nG01X0Y0",
    penUp: "M05\nG4P0.5\n",
    penDown: "M03S1000\nG4P0.5\n",
    penChangeCommand: "M226 #000000 Waiting for pen change\n",
  };

  let gcode: string = plot2Gcode(plotConfig, gcodeSettings);
  saveGcode(gcode, "axes.nc", gcodeSettings);
  renderPathsAsImage(allPaths, "axes.png");
}
