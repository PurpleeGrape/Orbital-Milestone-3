//Returns the html for pdf generation
const modDatabase = require('../../src/Components/Data/modata.json');

function vet(item) {
    const regex = /(NOC)|(Exchange)/;
    if (item === undefined) {
        return `<div class='cellBefore'>-Empty-</div>`;
    } else if (regex.test(item)){
        return item;
    } else {
        return item + ' - ' + modDatabase[item]["name"];
    }
}

function drawTable(timelineData, year) {
    const yearSem1 = "y" + year + "s" + 1;
    const yearSem2 = "y" + year + "s" + 2;
    const regex = /(NOC)|(Exchange)/;
    const spProgStyles = {
        verticalAlign: 'middle',
        fontSize: '50px',
        fontWeight: 'bolder'
    }
    const rowSpanSize = timelineData[yearSem1].length > timelineData[yearSem2].length ?
        ((timelineData[yearSem1].length > 5) ? timelineData[yearSem1].length : 5) :
        ((timelineData[yearSem2].length > 5) ? timelineData[yearSem2].length : 5)
    if (regex.test(timelineData[yearSem1][0]) && regex.test(timelineData[yearSem2][0])) {
        //Entire year which user will be or have went to special programmes (NOC/Exchange)
        return `<tr>
            <th>${"Year " + year}</th>
            <td style={${spProgStyles}}>${vet(timelineData[yearSem1][0])}</td>
            <td style={${spProgStyles}}>${vet(timelineData[yearSem2][0])}</td>
            </tr>`
    } else if (regex.test(timelineData[yearSem1][0])) {
        //sem1 of the year which user will be or have went to special programmes (NOC/Exchange)
        var result = [`<tr>
            <th style=${{verticalAlign: 'middle'}} rowSpan=${rowSpanSize}>${"Year " + year}</th>
            <td style=${{spProgStyles}} rowSpan=${rowSpanSize}>${vet(timelineData[yearSem1][0])}</td>
            <td style={{verticalAlign: 'middle'}}>${vet(timelineData[yearSem2][0])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem2][1])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem2][2])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem2][3])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem2][4])}</td>
            </tr>`
            ];
            for (var i = 5; i < rowSpanSize; i = i + 1) {
                const tableRow = `<tr>
                    <td>${vet(timelineData[yearSem2][i])}</td>
                </tr>`
                result.push(tableRow);
            }
            return result;
    } else if (regex.test(timelineData[yearSem2][0])) {
        //sem2 of the year which user will be or have went to special programmes (NOC/Exchange)
        var result = [`<tr>
            <th style=${{verticalAlign: 'middle'}} rowSpan=${rowSpanSize}>${"Year " + year}</th>
            <td>${timelineData[yearSem1][0]}</td>
            <td style=${spProgStyles} rowSpan=${rowSpanSize}>${timelineData[yearSem2][0]}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem1][1])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem1][2])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem1][3])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem1][4])}</td>
            </tr>`
            ];

            for (var i = 5; i < rowSpanSize; i = i + 1) {
            const tableRow = `<tr>
                <td>${vet(timelineData[yearSem1][i])}</td>
            </tr>`
            result.push(tableRow);
            }
            return result;
    } else {
        var result = [`<tr>
            <th style=${{verticalAlign: 'middle'}} rowSpan=${rowSpanSize}>${"Year " + year}</th>
            <td>${vet(timelineData[yearSem1][0])}</td>
            <td>${vet(timelineData[yearSem2][0])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem1][1])}</td>
                <td>${vet(timelineData[yearSem2][1])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem1][2])}</td>
                <td>${vet(timelineData[yearSem2][2])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem1][3])}</td>
                <td>${vet(timelineData[yearSem2][3])}</td>
            </tr>`,
            `<tr>
                <td>${vet(timelineData[yearSem1][4])}</td>
                <td>${vet(timelineData[yearSem2][4])}</td>
            </tr>`
            ];
            for (var i = 5; i < rowSpanSize; i = i + 1) {
                const tableRow = `<tr>
                <td>${vet(timelineData[yearSem1][i])}</td>
                <td>${vet(timelineData[yearSem2][i])}</td>
                </tr>`
                result.push(tableRow);
            }
            return result;
    }
}

module.exports = ({timelineData, maxCount}) => {
    return ` 
    <!doctype html>
    <html>
       <head>
          <meta charset="utf-8">
          <title>PDF Result Template</title>
          <style>
            body {
                margin: 0;
                background: white;
                width: 100%;
                height: 100%;
                text-align: center;
                font-size: 27px;
            }

            #Timeline {
                border: 5px solid black;
                border-radius: 15px;
                border-collapse: collapse;
                width: 100%;
            }

            #Timeline td, #Timeline th {
                padding: 8px;
                border: 3px solid white;
            }

            #Timeline tr:nth-child(even){background-color: #f2f2f2;}

            #Timeline tr:hover {background-color: #ddd;}

            .cellBefore {
                color: rgb(150, 150, 150);
                font-size: 23px;
            }

            #Timeline th {
                padding-top: 12px;
                padding-bottom: 12px;
                text-align: center;
                background-color: black;
                color: white;
            }
          </style>
       </head>
       <body>
            <table id="Timeline">
                    <tr>
                        <th>Timeline</th>
                        <th>Semester 1</th>
                        <th>Semester 2</th>
                    </tr>
                    ${drawTable(timelineData, 1)}
                    ${drawTable(timelineData, 2)}
                    ${drawTable(timelineData, 3)}
                    ${drawTable(timelineData, 4)}
            </table>
       </body>
    </html>
    `
        
}