import { Path, generateAxes, plotPoints } from "./render";
import { paths2Gcode, saveGcode, GcodeSettings, renderPathsAsImage } from "./gcode";
import { Plot, generatePlotPoints } from "./math";

const f: string = "x^2";

axesTest();

function axesTest() {
  const settings = {
    dividerX: 10,
    dividerY: 10,
    dividerLength: 1,
    bounds: {
      xMin: -5,
      xMax: 10,
      yMin: -10,
      yMax: 10,
    },
  };
  let paths: Path[] = generateAxes(settings);

  let plot: Plot = generatePlotPoints(f, { min: -5, max: 10, points: 1000 });

  let graph: Path = plotPoints(plot, settings);

  paths.push(graph);

  let gcodeSettings: GcodeSettings = {
    feedRate: 1000,
    startGcode: "G28\nG90\nG1 Z5 F5000\nG1 X0 Y0 F5000\nG1 Z0 F5000\n",
    endGcode: "G1 Z5 F5000\nG28\n",
    penUp: "M03 S0\n",
    penDown: "M03 S100\n",
  };

  let gcode: string = paths2Gcode(paths, gcodeSettings);
  saveGcode(gcode, "axes.nc", gcodeSettings);
  renderPathsAsImage(paths, "axes.png");
}
