// imports
import * as fs from "fs";
import { createCanvas } from "canvas";
import { Path } from "./render";

export interface GcodeSettings {
  feedRate: number;
  startGcode: string;
  endGcode: string;
  penUp: string;
  penDown: string;
}

export function paths2Gcode(paths: Path[], settings: GcodeSettings): string {
  let gcode: string = "";
  for (let path of paths) {
    for (let i = 0; i < path.points.length; i++) {
      let point = path.points[i];

      gcode += `G1 X${point[0]} Y${point[1]}\n`;
      if (i == 0) {
        gcode += settings.penDown;
      }
      if (i == path.points.length - 1) {
        gcode += settings.penUp;
      }
    }
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
    context.moveTo(path.points[0][0] + width / 2, -path.points[0][1] + height / 2);
    for (let i = 1; i < path.points.length; i++) {
      context.lineTo(path.points[i][0] + width / 2, -path.points[i][1] + height / 2);
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
