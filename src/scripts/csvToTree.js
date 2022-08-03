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

root = treeData[0];

const h = hierarchy(root);

h.descendants().forEach((d, i) => {
    d.id = `${i}`;
    d._children = d.children;
    d.children = null;
});

if (DEBUG) console.log(h._children)

const layout = tree().nodeSize([25, 200]);

const colorScale = scaleLinear().domain([0, 5]).range(['#ff0072', '#0041d0']);

function getElements() {
    const root = layout(h);

    const nodes = root.descendants().map((d) => ({
        id: d.id,
        data: { label: d.data.name, depth: d.depth },
        position: { x: d.y, y: d.x },
        style: { padding: 0, backgroundColor: colorScale(d.depth), border: 'none', color: 'white', fontWeight: 'bold' },
        //sourcePosition: Position.Right,
        //targetPosition: Position.Left,
        type: d._children ? 'default' : 'output',
    }));

    const edges = root.links().map((d, i) => ({ id: `${i}`, source: d.source.id, target: d.target.id }));

    return { nodes, edges };
}

const initialElements = getElements();

console.log(initialElements.nodes);