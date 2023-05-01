// imports
import * as fs from "fs";
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

export function saveGcode(gcode: string, fileName: string, gcodeSettings: GcodeSettings) {
  //add start and end gcode
  gcode = gcodeSettings.startGcode + gcode + gcodeSettings.endGcode;
  fs.writeFileSync(fileName, gcode);
}
