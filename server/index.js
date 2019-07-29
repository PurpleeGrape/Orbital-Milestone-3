//Important notes!!!!
//To use this server application, run node index.js in the /server directory.
//(One layer above /server/document)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pdf = require('html-pdf');

const app = express();
const pdfTemplate = require('./document');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//POSTING - Generation of PDF and fetching of data
app.post('/create-pdf', (req, res) => {
    pdf.create(pdfTemplate(req.body), {}).toFile('timeline.pdf', err => {
        if (err) {
            res.send(Promise.reject());
        } else {
            res.send(Promise.resolve());
        }
    })
})

//GETTING - Obtaining PDF from server
app.get('/fetch-pdf', (req, res) => {
    res.sendFile(`${__dirname}/timeline.pdf`)
})

app.listen(port, () => { console.log('Listening to port', port)});