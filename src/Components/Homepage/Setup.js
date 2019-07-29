import fb from '../Config/config';
import Data from '../Planning/Timeline/Data';
//import { getGraphData } from '../Data/initData';
import { getGraphData } from '../Data/initData2';
const MajReqData = require('../Data/MajReqData.json');

function setup(email, faculty, course, addMods) {
    //course example: "Computer Science"
    var userModules = MajReqData[course];
    userModules = userModules + " " + addMods;
    console.log(userModules);
    //Concatenating addMods into userModules
    var initialGraphData = getGraphData(userModules);
    //var initialGraphData2 = getGraphData2(userModules);
    console.log(initialGraphData);
    //console.log(initialGraphData2);
    var newUser = {
        email: email,
        faculty: faculty,
        course: course,
        timelineData: Data,
        graphData: initialGraphData,
        exchangeData: {
            country: null,
            school: null,
            year: null,
            semester: null,
            codeString: null,
            moduleMapping: []
        },
        NOCData: {
            place: null,
            year: null,
            semester: null,
            duration: null,
            codeString: null,
            internship: [null, null, null, null, null, null, null, null],
            entrepreneurship: [null, null, null, null],
            discipline: [null, null]
        }
    }
    var database = fb.firestore();
    return database.collection('users').doc(email).set(newUser)
        /*.then(u => {
                console.log(email + " initialised in database");
                resolve();
            })
        .catch(v => {
                console.log(email + " failed to initialise in database");
                reject();
            });*/
}

export default setup;