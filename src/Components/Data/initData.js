import { Physics } from './MajReqData'
const jsonData = require('./modata.json');
/*
Processes input files
1. Scans for module code in input file ( '^[a-zA-Z]{2,3}[0-9]{4}' ) and stores in a userModList
2. For Every module code in list, retrieve module from modata.json and append to userNodes object
3. Scans every name object in "require" list and 
3. build userLinks object
*/
// var input = './testInput.txt'; // to be replaced by real user input


export function getGraphData(input) {
    if (input===undefined) {
        input = Physics
    }
    
    // Read and looks for module codes in input
    const regex = /[A-Z]{2,3}[0-9]{4}[A-Z]?/g

    // var userModList = fs.readFileSync(input, 'utf8').toUpperCase().match(regex).sort();
    // fetch(input).then(function(r){ var userModList = r.text().toUpperCase().match(regex).sort()})

    var userModList = input.toUpperCase().match(regex).sort();
    // Writing to required java object structure
    var userMod = {
        nodes:[],  
        links:[]
    }
    var availMods={};
    var mod, items, prereqMod, nextMod, modsByColn, coln, modID;
    // writing Nodes property
    for(mod of userModList){
        if (jsonData[mod]==null) {
            console.log("Don't have " + mod + " on NUSMods\n");
        } else if (availMods[mod]!=null) {
            console.log("Duplicate of "+mod)
        }else {
            availMods[mod]={y:-1, next:[]};
            userMod.nodes.push(jsonData[mod]);
            console.log(jsonData[mod].name + " Added\n");
        }
    }
    // Updating required list

    // Writing Links property
    for (mod of userMod.nodes) {
        for (items of mod.require) {
            for (prereqMod of items.name) {
                if (availMods.hasOwnProperty(prereqMod)) {
                    var temp = {
                        source:null,
                        target:null
                    }
                    temp.source=prereqMod;
                    temp.target=mod.id;
                    availMods[prereqMod].next.push(mod.id);
                    userMod.links.push(temp);
                }
            }
        }
    }

    // Assigning x coordinate via BFS
    var unlinkedMods={}; // collection of unlinked mods
    var numbers = [0];
    function BFS(availMods) {
        for(mod of Object.keys(availMods)) {
            if (availMods[mod].y===-1) {
                add(mod, 1);
            }
        }
        function add(mod, num) {
            if (availMods[mod] === undefined) {
                return;
            }
            if (availMods[mod].y<num){
                availMods[mod].y=num;
            }
            for(nextMod of availMods[mod].next) {
                add(nextMod, num+1)
            }
            if (num==1&&availMods[mod].next.length==0) {
                unlinkedMods[mod]={
                    y:numbers[0]%5+0.5,
                    x:~~(numbers[0]++/5)+1
                };
                delete availMods[mod];
            }
        }
    }
    var yScale=0.13*window.screen.height;
    var yBase = 20;
    BFS(availMods);
    for (mod of userMod.nodes) {
        if (availMods.hasOwnProperty(mod.id)) {
            mod.y=availMods[mod.id].y*(10+yScale);
        } 
    }

    // Assigning y coordinates 
    var xScale=0.065*window.screen.width;
    var xBase=40;
    var maxX=0;
    modsByColn = {
        1:[],
        2:[],
        3:[],
        4:[],
        5:[],
        6:[],
        7:[],
        8:[],
    }
    for(mod of Object.keys(availMods)) {
        modsByColn[availMods[mod].y].push(mod);
    }
    function compare(a,b) {
        function getVal(a) {
            var sum=0;
            for (mod of userMod.nodes) {
                if (mod.id==a) {
                    for (items of mod.require) {
                        for (prereqMod of items.name) {
                            if (availMods[prereqMod]!=null){
                                sum+=availMods[prereqMod].y
                            }
                        }
                    }
                }
            }
        }
        if (getVal(a)==getVal(b)) {
            return availMods[b].next.length - availMods[a].next.length
        } else {
            return getVal(a)-getVal(b)
        }
    }
    for(coln in modsByColn) {
        if (coln%2==1) {
            xBase=0;
        } else {xBase=20;}
        var num = 1;
        modsByColn[coln].sort(compare);
        for (modID of modsByColn[coln]) {
            for (mod of userMod.nodes) {
                if (mod.id==modID) {
                    mod.x=num++*xScale+xBase;
                    if (mod.x>maxX) {
                        maxX=mod.x;
                    }
                }
            }
        }
    }
    // Assigning x and y coordinates for unlinked mods
    for (mod of userMod.nodes) {
        if (unlinkedMods.hasOwnProperty(mod.id)) {
            mod.y=unlinkedMods[mod.id].y*yScale+yBase;
            mod.x=unlinkedMods[mod.id].x*xScale+maxX;
        }
    }

    return userMod;
}

