#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const args = process.argv;
const [node_bin, jszip_reverse_bin, directory, script_output_file] = args;

const main = async function () {
  try {
    const files = fs.readdirSync(directory, { recursive: true });
    if (!files.length) {
      throw new Error("Required argument «files» to have 1 entry");
    }
    if(!script_output_file) {
      throw new Error("Required argument «script_output_file» to have 1 entry");
    }
    const original_path = path.resolve(directory);
    const script_initializator_1 = path.resolve(__dirname, "lib/filesaver.js");
    const script_initialization_1 = fs.readFileSync(script_initializator_1).toString();
    const script_initializator_2 = path.resolve(__dirname, "lib/jszip.js");
    const script_initialization_2 = fs.readFileSync(script_initializator_2).toString();
    let script_output = "";
    script_output += script_initialization_2 + "\n";
    script_output += script_initialization_1 + "\n";
    script_output += "const jszip = new JSZip();\n";
    Iterating_files:
    for(let index=0; index<files.length; index++) {
      const file = files[index];
      const file_path = path.resolve(original_path, file);
      const file_stats = fs.lstatSync(file_path);
      if(file_stats.isDirectory()) {
        console.log("[*] Importing folder: " + file);
        script_output += "jszip.folder(";
        script_output += JSON.stringify(file);
        script_output += ");\n";
      } else {
        console.log("[*] Importing file: " + file);
        const file_contents = fs.readFileSync(file_path).toString();
        script_output += "jszip.file(";
        script_output += JSON.stringify(file);
        script_output += ", ";
        script_output += JSON.stringify(file_contents);
        script_output += ");\n";
      }
    }
    script_output += `jszip.generateAsync({type:"blob"})
    .then(function(content) {
        saveAs(content, "project.zip");
    });\n`;
    fs.writeFileSync(script_output_file, script_output, "utf8");
  } catch (error) {
    console.log(error);
  }
};

main();

