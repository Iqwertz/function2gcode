import { createCanvas } from "canvas";
import fs from "fs";
import { Path, generateAxes } from "./render";
import { paths2Gcode, saveGcode, GcodeSettings } from "./gcode";

// Dimensions of the image
const width = 1200;
const height = 627;

const f: string = "sqrt(1-x^2)";

axesTest();

function axesTest() {
  let paths: Path[] = generateAxes({
    dividerX: 10,
    dividerY: 10,
    dividerLength: 5,
    bounds: {
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10,
    },
  });

  let gcodeSettings: GcodeSettings = {
    feedRate: 1000,
    startGcode: "G28\nG90\nG1 Z5 F5000\nG1 X0 Y0 F5000\nG1 Z0 F5000\n",
    endGcode: "G1 Z5 F5000\nG28\n",
    penUp: "M03 S0\n",
    penDown: "M03 S100\n",
  };

  let gcode: string = paths2Gcode(paths, gcodeSettings);
  saveGcode(gcode, "axes.nc", gcodeSettings);
}

//plot(x, y);

//plot the function

// plot(x,y) plots the function to an image
function plot(x: number[], y: number[]) {
  // Instantiate the canvas object
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  // Set the background color
  context.fillStyle = "white";
  context.fillRect(0, 0, width, height);

  // Draw the axes
  context.beginPath();
  context.moveTo(0, height / 2);
  context.lineTo(width, height / 2);
  context.stroke();
  context.beginPath();
  context.moveTo(width / 2, 0);
  context.lineTo(width / 2, height);
  context.stroke();

  // Draw the function
  context.fillStyle = "black";
  for (let i = 0; i < x.length; i++) {
    context.fillRect(x[i] * 10, y[i] * 10, 1, 1);
  }

  // Write the image to file
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("./image.png", buffer);
}
