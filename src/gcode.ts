// imports
import * as fs from "fs";
import { createCanvas } from "canvas";
import { Path } from "./render";
import { Plot } from ".";

export interface GcodeSettings {
  feedRate: number;
  startGcode: string;
  endGcode: string;
  penUp: string;
  penDown: string;
  penChangeCommand: string;
}

export function plot2Gcode(plot: Plot, settings: GcodeSettings): string {
  let gcode: string = "";

  gcode += settings.startGcode;
  gcode += paths2Gcode(plot.axis, settings);
  for (let func of plot.functions) {
    if (func.path) {
      gcode += paths2Gcode(func.path, settings);
      gcode += settings.penChangeCommand;
    }
  }
  gcode += settings.endGcode;
  return gcode;
}

export function paths2Gcode(paths: Path[], settings: GcodeSettings): string {
  let gcode: string = "";
  let detectedNan = false;
  for (let path of paths) {
    for (let i = 0; i < path.points.length; i++) {
      let point = path.points[i];
      if (isNaN(point[0]) || isNaN(point[1])) {
        detectedNan = true;
      } else {
        gcode += `G1 X${point[0]} Y${point[1]}\n`;
        if (i == 0) {
          gcode += settings.penDown;
        }
        if (i == path.points.length - 1) {
          gcode += settings.penUp;
        }
      }
    }
  }
  if (detectedNan) {
    console.warn("NaN found while generating gcode");
    console.warn("This is probably caused by complex values in the function. Complex mode will be added in the future");
  }
  return gcode;
}

export function renderPathsAsImage(paths: Path[], fileName: string) {
  // Dimensions of the image
  const width = 100;
  const height = 100;
  // Instantiate the canvas object
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  // Set the background color
  context.fillStyle = "white";
  context.fillRect(0, 0, width, height);

  // Draw the paths
  for (let path of paths) {
    context.beginPath();
    context.moveTo(path.points[0][0], path.points[0][1]);
    for (let i = 1; i < path.points.length; i++) {
      context.lineTo(path.points[i][0], path.points[i][1]);
    }
    context.stroke();
  }

  // Write the image to file
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(fileName, buffer);
}

export function saveGcode(gcode: string, fileName: string, gcodeSettings: GcodeSettings) {
  //add start and end gcode
  gcode = gcodeSettings.startGcode + gcode + gcodeSettings.endGcode;
  fs.writeFileSync(fileName, gcode);
}
