import fs from 'fs';
import * as d3 from "d3";

const DEBUG = true;

// *** STATE ***
let root;

//===================================
// ** read file from csv
var data = fs.readFileSync("src/test.csv", "utf8");
let parsedData = d3.csvParse(data);
console.log(parsedData)

// create dataMap
var dataMap = parsedData.reduce(function (map, node) {
    map[node.name] = node;
    return map;
}, {});

// create the tree array
var treeData = [];
parsedData.forEach(function (node) {
    // add to parent
    var parent = dataMap[node.parent];
    if (parent) {
        // create child array if it doesn't exist
        (parent.children || (parent.children = []))
            // add node to child array
            .push(node);
    } else {
        // parent is null or missing
        treeData.push(node);
    }
});

if (DEBUG) console.log(treeData);

root = treeData[0];