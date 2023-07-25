import fs from "fs";

export function readFileAsString(filePath) {
    return fs.readFileSync(filePath).toString()
}