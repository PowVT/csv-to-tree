import fs from 'fs';
import * as d3 from "d3";
import { hierarchy, tree, scaleLinear } from 'd3';

const DEBUG = false;

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

//  data root (1st row) == input node
dataRoot = treeData[0];
// create root node
const h = hierarchy(dataRoot);
// 
h.descendants().forEach((data, index) => {
    data.id = `${index}`;
    data._children = data.children;
    data.children = null;
});

if (DEBUG) console.log(h._children)
// node size
const layout = tree().nodeSize([25, 200]);
// color scale
const colorScale = scaleLinear().domain([0, 5]).range(['#ff0072', '#0041d0']);

function getElements() {
    const root = layout(h);
    const nodes = root.descendants().map((node) => ({
        id: node.id,
        data: { label: node.data.name, depth: node.depth },
        position: { x: node.y, y: node.x },
        style: { padding: 0, backgroundColor: colorScale(node.depth), border: 'none', color: 'white', fontWeight: 'bold' },
        //sourcePosition: Position.Right,
        //targetPosition: Position.Left,
        type: node._children ? 'default' : 'output',
    }));

    const edges = root.links().map((edge, index) => ({ id: `${index}`, source: edge.source.id, target: edge.target.id }));

    return { nodes, edges };
}

const initialElements = getElements();

if (DEBUG) console.log(initialElements.nodes);