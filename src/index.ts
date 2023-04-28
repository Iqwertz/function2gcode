import { MathArray } from "mathjs";
import { create, all, Matrix } from "mathjs";

import { createCanvas } from "canvas";
import fs from "fs";

// Dimensions for the image
const width = 1200;
const height = 627;

const config = {};
const math = create(all, config);

const f: string = "sqrt(1-x^2)";

const plotInterval: number[] = [-10, 10, 100]; // [min, max, step]

let x: number[] = createInterval(plotInterval[0], plotInterval[1], plotInterval[2]);

let y: number[] = calculateY(x, f);

plot(x, y);

//plot the function

//creates an array of numbers from min to max with size amount of evenly spaced intervals
function createInterval(min: number, max: number, size: number): number[] {
  let interval: number[] = [];
  let step = (max - min) / size;
  for (let i = min; i < max; i += step) {
    interval.push(i);
  }
  return interval;
}

function calculateY(x: number[], f: string): number[] {
  let y: number[] = [];
  for (let i = 0; i < x.length; i++) {
    y.push(math.evaluate(f, { x: x[i] }));
  }
  return y;
}

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
