import React from 'react';
import Topbar from './Topbar';
import { Graph } from 'react-d3-graph';
import { myConfig } from '../Graph/GraphConfig';
import {Spinner, Label, Modal, Form, FormGroup,Input, Row, Col, ModalHeader, ModalBody, ModalFooter, Container, Button, Table} from 'reactstrap';
import CustomNode from '../Graph/CustomNode';
import fb from '../../Config/config';
const moduleDatabase = require('../../Data/modata.json');

class Timeline extends React.Component {
    constructor() {
        super();
        const config = myConfig;
        var tempState = {
            data : null,
            showModal : false,
            showTimeline: false,
            showSidebar: false,
            config,
            data2: null,
            addedList: [],
            isLoading: true,
            showSpecialModal: null,
            usefulTemp: []
        };  
        this.state = tempState;
        this.addToTimeline = this.addToTimeline.bind(this);
        this.removeFromTimeline = this.removeFromTimeline.bind(this);
        this.removeFromTimeline2 = this.removeFromTimeline2.bind(this);
        this.drawTable = this.drawTable.bind(this);
        this.drawEmptyCell = this.drawEmptyCell.bind(this);
        this.findModule = this.findModule.bind(this);
        this.toggleTimeline = this.toggleTimeline.bind(this);
        this.drawGraph = this.drawGraph.bind(this);
        this.showModal = this.showModal.bind(this);
        this.generateButtons = this.generateButtons.bind(this);
        this.modalButton = this.modalButton.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
        this.showEditForm = this.showEditForm.bind(this)
        this.handleOnChangeEditForm = this.handleOnChangeEditForm.bind(this)
        this.openNUSMODS = this.openNUSMODS.bind(this);
        this.specialToggle = this.specialToggle.bind(this);
        this.showSpecialModal = this.showSpecialModal.bind(this);
        this.specialModalButton = this.specialModalButton.bind(this);
        this.handleSpecialChange = this.handleSpecialChange.bind(this);
    }

    componentDidMount() {
        var database = fb.firestore();
        const email = fb.auth().currentUser.email;
        var graphData = database.collection('users').doc(email).get().then(doc => {
            if (!doc.exists) {
                console.log('No such document in database');
            } else {
                this.setState(prevState => {
                    return {
                        ...prevState,
                        data2: doc.data().graphData,
                        isLoading: false,
                        data: doc.data().timelineData
                    }
                })
            }
        }).catch(err => { console.log('Error getting document')});
    }

    specialToggle() {
        this.setState(prevState => {
            return {
                ...prevState,
                showSpecialModal: null,
                usefulTemp: []
            }
        })
    }

    specialModalButton(obj, event) {
        event.preventDefault();
        for (var exempted of this.state.usefulTemp) {
            var done = false;
            for (var node of this.state.data2.nodes) {
                if (done) {
                    break;
                } else if (node.id === exempted) {
                    this.addToTimeline(node.id, -1, -1);
                    break;
                } else {
                    for (var nodeEquiv of node.equivalent) {
                        if (nodeEquiv === exempted) {
                            this.addToTimeline(node.id, -1, -1);
                            done = true;
                            break;
                        }
                    }
                }
            }
            if (!done) {
                this.addToTimeline(exempted, -1, -1);
            }
        }
        this.setState(prevState => {
            return {
                ...prevState,
                showSpecialModal: null,
                usefulTemp: []
            }
        })
    }

    handleSpecialChange(event) {
        const name = event.target.name;
        const checked = event.target.checked;
        if (checked) {
            this.setState(prevState => {
                var newUsefulTemp = prevState.usefulTemp;
                newUsefulTemp.push(name);
                return {
                    ...prevState,
                    usefulTemp: newUsefulTemp
                }
            })
        } else {
            this.setState(prevState => {
                const nameToBeRemoved = name;
                var newUsefulTemp = [];
                for (var n of prevState.usefulTemp) {
                    if (n !== nameToBeRemoved) {
                        newUsefulTemp.push(n);
                    }
                }
                return {
                    ...prevState,
                    usefulTemp: newUsefulTemp
                }
            })
        }
        console.log(event.target.name);
        console.log(event.target.checked);
    }

    showSpecialModal(obj) {
        const required = [];
        var counter = 0;
        for (var req of obj.require) {
            if (!req.unlocked) {
                var temp = "Any one of: ";
                for (var i = 0; i < req.name.length; i = i + 1) {
                    if (i != (req.name.length - 1)) {
                        temp = temp + req.name[i] + ", ";
                    } else {
                        temp = temp + req.name[i]
                    }
                }
                const htmlLayout = <FormGroup>
                    <Label style={{marginLeft: '20px'}}>
                        <Input type="checkbox" name={req.name[0]} onChange={e => this.handleSpecialChange(e)}></Input>
                        {temp}
                    </Label>
                </FormGroup>
                required.push(htmlLayout);
                counter = counter + 1;
            }
        }
        return (
            <Form style={{margin: '30px', textAlign:'justify'}} onSubmit={(e) => this.specialModalButton(obj, e)}>
                <FormGroup style={{fontWeight: 'bold', fontSize: '18px'}}>{obj.id + " - " + obj.name}</FormGroup>
                <FormGroup style={{fontWeight: 'bold', fontSize: '15px'}}>
                    You have not unlocked all of the prerequisites for this module. To make an exception, select the module(s)
                    from the following options that you have cleared or are exempted from. (E.g some ES modules)
                </FormGroup>
                {required}
                <FormGroup>
                    <Button type="submit">Make this exception for me!</Button>
                </FormGroup>
            </Form>
        )
    }

    toggleTimeline() {
        this.setState(prevState => {
            return {
                ...prevState,
                data: prevState.data,
                showModal: false,
                showTimeline: !prevState.showTimeline,
                showSidebar: false,
                addedList: prevState.addedList,
                data2: prevState.data2
            }
        })
    }

    //Draws an empty cell containing a message (acts as a placeholder when timeline is empty)
    drawEmptyCell(msg) {
        const regex = /(NOC)|(Exchange)/g;
        const finalizedMsg = msg === undefined ? undefined : (regex.test(msg) ? msg : msg + " - " + moduleDatabase[msg].name);
        return <div class={msg === undefined ? "cellBefore" : regex.test(msg) ? "cellSp" : "cellAfter"}>{msg === undefined ? "-Empty-" : finalizedMsg}</div>;
    }

    //Adds <String> module, <Integer> year, <Integer> semester to the timeline
    addToTimeline(module, year, semester){
        this.setState(prevState => {
            var updatedSemesterYear = 'y' + year + 's' + semester;
            var updatedList = prevState.addedList.map(x => x);
            updatedList.push(module);
            for (var i = 0; i < prevState.data2.nodes.length; i = i + 1) {
                if (prevState.data2.nodes[i].id === module) {
                    prevState.data2.nodes[i].added = [year, semester];
                }
                var updateUnlock = prevState.data2.nodes[i].require;
                for (var k = 0; k < updateUnlock.length; k = k + 1) {
                    for (var p = 0; p < updateUnlock[k].name.length; p = p + 1) {
                        if (updateUnlock[k].name[p] === module) {
                            updateUnlock[k].unlocked = true;
                            break;
                        }
                    }
                }
            }
            var newState = { data : { }, addedList : updatedList, showTimeline: prevState.showTimeline, data2: prevState.data2 };
            for(var i = 1; i <= 4; i = i + 1) {
                for(var j = 1; j <= 2; j = j + 1) {
                    var semesterYear = 'y' + i + 's' + j;
                    if (semesterYear === updatedSemesterYear) {
                        newState.data[semesterYear] = prevState.data[semesterYear].map(x => x);
                        newState.data[semesterYear].push(module);
                    } else {
                        newState.data[semesterYear] = prevState.data[semesterYear].map(x => x);
                    }
                }
            }
            return newState;
        })
    }

    //Removes <Object> module from the timeline
    removeFromTimeline2(moduleObj) {
        const moduleName = moduleObj.module;
        const year = moduleObj.added[0];
        const sem = moduleObj.added[1];
        this.setState(prevState => {
            var yearSem = 'y' + year + 's' + sem;
            var newData = [];
            for (var i = 0; i < this.state.data[yearSem].length; i = i + 1) {
                if (this.state.data[yearSem][i] !== moduleName) {
                    newData.push(this.state.data[yearSem][i]);
                }
            }
            this.state.data[yearSem] = newData;
            return {
                ...prevState,
                data: this.state.data
            }
        })
    }

    //Removes <String> module from the timeline
    removeFromTimeline(module) {
        var moduleObject = null;
        for (var i = 0; i < this.state.data2.nodes.length; i = i + 1) {
            if (this.state.data2.nodes[i].id === module) {
                moduleObject = this.state.data2.nodes[i];
                break;
            }
        }
        if (moduleObject.added[0] === 0) { //Not in the timeline
            return
        } else {
            moduleObject.added = [0,0];
            this.setState(prevState => {
                var updatedList = [];
                for (var h = 0; h < prevState.data2.nodes.length; h = h + 1) {
                    var updateUnlock = prevState.data2.nodes[h].require;
                    for (var j = 0; j < updateUnlock.length; j = j + 1) {
                        for (var k = 0; k < updateUnlock[j].name.length; k = k + 1) {
                            if (updateUnlock[j].name[k] === module) {
                                updateUnlock[j].unlocked = false;
                                break;
                            }
                        }
                    }
                }
                for (var i = 0; i < prevState.addedList.length; i = i + 1) {
                    if (!(prevState.addedList[i] === module)) {
                        updatedList.push(prevState.addedList[i]);
                    }
                }
                prevState.data2.module = false;
                var newState = { ...prevState, data : { }, showTimeline: prevState.showTimeline, addedList: updatedList, data2: prevState.data2, showModal: false };
                for(var i = 1; i <= 4; i = i + 1) {
                    for(var j = 1; j <= 2; j = j + 1) {
                        var semesterYear = 'y' + i + 's' + j;
                        var k = 0;
                        var temp = [];
                        while (k < prevState.data[semesterYear].length) {
                            if (!(prevState.data[semesterYear][k] === module)) {
                                temp.push(prevState.data[semesterYear][k]);
                            }
                            k++;
                        }
                        newState.data[semesterYear] = temp;
                    }
                }
                return newState;
            })
            for (var t = 0; t < this.state.data2.links.length; t = t + 1) {
                if (this.state.data2.links[t].source === module) {
                    this.removeFromTimeline(this.state.data2.links[t].target);
                }
            }
        }
    }

    //Finds and return the year and sem in the timeline returns: [year, semester]
    findModule(module) {
        var result = [ null, null ];
        for (var i = 1; i <= 4; i = i + 1) {
            for (var j = 1; j <= 2; j = j + 1) {
                const semesterYear = 'y' + i + 's' + j;
                for (var k = 0; k < this.state.data[semesterYear].length; k = k + 1) {
                    if (this.state.data[semesterYear][k] === module) {
                        result[0] = i;
                        result[1] = j;
                    }
                }
            }
        }
        return result;
    }

    //Modals
    modalButton(module, year, semester) {
        this.setState(prevState => {
            return {
                ...prevState,
                data : prevState.data,
                showModal : false,
                showTimeline: false,
                showSidebar: false,
                config: prevState.config,
                data2: prevState.data2,
                addedList: prevState.addedList
            }
        })
        this.addToTimeline(module, year, semester);
        console.log(module, ' is added to year ' + year + ' sem ' + semester);
    }

    toggleModal() {
        this.setState(prevState => {
            return {
                ...prevState,
                data : prevState.data,
                showModal : !prevState.showModal,
                showTimeline: false,
                showSidebar: false,
                config: prevState.config,
                data2: prevState.data2,
                addedList : prevState.addedList
            }
        })
    }

    showEditForm(obj) {
        const equivalentModules = obj.equivalent.map(mod => {
          return (
            <option value={mod}>{mod}</option>
          )
        })
        return (
            <Form>
                <label>
                {"Not taking " + obj.id + "? Pick another equivalent module:"} <br></br>
                </label>
                <Input type="select" value={obj.id} onChange={e => this.handleOnChangeEditForm(obj, e)}>
                    {equivalentModules}
                </Input>
            </Form>
        )
    }

    handleOnChangeEditForm(object, event) {
        //Must create constant to store value of event.target.value because it is asynchronous
        const updatedName = event.target.value;
        var modalObj = null;

        this.setState(prevState => {
          var updatedData = { nodes: prevState.data2.nodes.map(x => x), links: prevState.data2.links.map(x => x)};
          for (var i = 0; i < updatedData.nodes.length; i = i + 1) {
              if (updatedData.nodes[i].id === object.id) {
                  updatedData.nodes[i] = {
                      id: updatedName,
                      x: updatedData.nodes[i].x,
                      y: updatedData.nodes[i].y,
                      equivalent: updatedData.nodes[i].equivalent,
                      require: updatedData.nodes[i].require,
                      added: [0,0],
                      name: updatedData.nodes[i].name
                  }
                  modalObj = updatedData.nodes[i]
                  break;
              }
          }
          for (var i = 0; i < updatedData.links.length; i = i + 1) {
                if (updatedData.links[i].source === object.id) {
                    updatedData.links[i] = {
                        source: updatedName,
                        target: updatedData.links[i].target
                    }
                } else if (updatedData.links[i].target === object.id) {
                    updatedData.links[i] = {
                        source: updatedData.links[i].source,
                        target: updatedName
                    }
                }                
          }
          return {
            ...prevState,
            data : prevState.data,
            showModal : modalObj,
            showTimeline: false,
            showSidebar: false,
            config: prevState.config,
            data2: updatedData,
            addedList: prevState.addedList
        }})
    }

    //Helper function to generate buttons for showModal(obj)
    generateButtons(yearSem, module) {
        const result = [];
        var flag = (yearSem[0] - 1) * 2 + yearSem[1];
        var counter = 1;
        var spProgram = [];
        Object.keys(this.state.data).forEach(key => {
            const regex = /(NOC)|(Exchange)/;
            if (regex.test(this.state.data[key][0])) {
                spProgram.push(key);
            }
        })
        for (var i = 1; i <= 4; i = i + 1) {
            for (var j = 1; j <= 2; j = j + 1) {
                const ys = 'y' + i + 's' + j;
                if ((counter > flag) && !spProgram.includes(ys)) {
                    //show clickable button
                    const year = i;
                    const sem = j;
                    const btn = <Button onClick={() => this.modalButton(module, year, sem)}>{"Year " + year + " Sem " + sem}</Button>;
                    result.push(btn);
                } else {
                    const year = i;
                    const sem = j;
                    const btn = <Button disabled>{"Year " + year + " Sem " + sem}</Button>;
                    result.push(btn);
                }
                counter = counter + 1;
            }
        }
        return result;
    }

    showModal(obj) {
        const module = obj.id;
        var latestPrereqYearSem = [0,0];
        for (var k = 0; k < obj.require.length; k = k + 1) {
            var preReqList = obj.require[k];
            for (var j = 0; j < preReqList.name.length; j = j + 1) {
                var preReq = preReqList.name[j];
                for (var i = 0; i < this.state.data2.nodes.length; i = i + 1) {
                    var moduleObj = this.state.data2.nodes[i];
                    if (moduleObj.id === preReq) {
                        console.log(moduleObj.id, ' added to ', moduleObj.added);
                        const yearSemAdded = moduleObj.added;
                        latestPrereqYearSem = latestPrereqYearSem[0] > yearSemAdded[0] ?
                            latestPrereqYearSem : latestPrereqYearSem[0] < yearSemAdded[0] ?
                            yearSemAdded : latestPrereqYearSem[1] > yearSemAdded[1] ?
                            latestPrereqYearSem : yearSemAdded;
                        break;
                    }
                }
            }
        }
        console.log(latestPrereqYearSem);
        if (obj.added[0] === 0) {
            return (<div class="modal-content" id={"myModal" + obj.id}>
                    <ModalHeader toggle={this.toggleModal}>{obj.id + ' - ' + obj.name}</ModalHeader>
                    <div class="modal-msg">
                    {this.showEditForm(obj)}
                    </div>
                    <Container>
                        <Row className="Info">
                            <Col>
                            <div class="modalMoreInfo" onClick={() => this.openNUSMODS(obj)}>
                                    Get more information about this module here!
                            </div>
                            </Col>
                            <Col>
                                <div style={{marginBottom: 10}}>{"Add " + module + " to?"}</div>
                                <div class="modalButtons">
                                    {this.generateButtons(latestPrereqYearSem, module)}
                                </div> 
                            </Col>
                        </Row>
                    </Container>
                    
                </div>
            );
        } else {
            const future = [];
            for (var link of this.state.data2.links) {
                if (link.source === obj.id) {
                    future.push(link.target);
                }
            }
            var ys = [];
            for (var futureMod of future) {
                for (var node of this.state.data2.nodes) {
                    if (node.id === futureMod) {
                        const futureAdd = node.added;
                        if (futureAdd[0] !== 0) {
                            ys.push(futureAdd);
                        }
                    }
                }
            }
            var buttonRes = [5,5];
            if (ys.length > 0) {
                for (var addedPeriod of ys) {
                    buttonRes = buttonRes[0] > addedPeriod[0] ? addedPeriod
                                : (buttonRes[0] === addedPeriod[0] ? (buttonRes[1] > addedPeriod[1] ? addedPeriod : buttonRes)
                                : buttonRes)
                }
            }
            var buttons = [];
            var marked = false;
            const regex = /(NOC)|(Exchange)/;
            for (var i = 1; i <= 4; i = i + 1) {
                for (var j = 1; j <= 2; j = j + 1) {
                    const yrSem = 'y' + i + 's' + j;
                    console.log(yrSem + ' ' + this.state.data[yrSem][0])
                    if (marked || regex.test(this.state.data[yrSem][0])) {
                        const btn = <Button disabled>{"Year " + i + " Sem " + j}</Button>
                        buttons.push(btn);
                    } else {
                        if (i === buttonRes[0] && j === buttonRes[1]) {
                            marked = true;
                            const btn = <Button disabled>{"Year " + i + " Sem " + j}</Button>
                            buttons.push(btn);
                        } else {
                            const year = i;
                            const sem = j;
                            const btnFunc = () => {
                                const modObj = {
                                    module: obj.id,
                                    added: obj.added
                                }
                                this.removeFromTimeline2(modObj);
                                this.addToTimeline(obj.id, year, sem);
                                this.setState(prevState => {
                                    return {
                                        ...prevState,
                                        showModal: false
                                    }
                                })
                            }
                            const btn = <Button onClick={btnFunc}>{"Year " + i + " Sem " + j}</Button>
                            buttons.push(btn);
                        }
                    }
                }
            }
            return (<div class="modal-content" id={"myModal" + obj.id}>
                <ModalHeader toggle={this.toggleModal}>{obj.id + ' - ' + obj.name}</ModalHeader>
                <ModalBody>
                    <div>{obj.added[0] === -1 ? "You are exempted/ have cleared this module requirement. Do you want to remove your exemption?" : "Remove " + obj.id + " from year " + obj.added[0] + " semester " + obj.added[1] + "?"}</div>
                    <div>{"WARNING: any modules that require " + obj.id + " will be removed from the timeline as well!"}</div>
                    <div>{"Alternatively you can change the timeline slot for " + obj.id}</div>
                </ModalBody>
                <ModalFooter>
                    <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', width: '100%', alignItems:'center'}}>
                         <div>Remove module? <br></br><Button style={{marginTop: '10px'}} onClick={() => this.removeFromTimeline(obj.id)}>Remove</Button></div>
                         <div>
                             Change to which year/sem?
                             <div style={{marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', gridGap: '7px'}}>
                                {buttons}
                             </div>
                         </div>
                    </div>
                </ModalFooter>
            </div>);
        }
    }

    openNUSMODS(obj) {
        const url = "https://nusmods.com/modules/" + obj.id;
        window.open(url);
    }

    drawTable(year) {
        const yearSem1 = "y" + year + "s" + 1;
        const yearSem2 = "y" + year + "s" + 2;
        const regex = /(NOC)|(Exchange)/;
        const spProgStyles = {
            verticalAlign: 'middle',
            fontSize: '50px',
            fontWeight: 'bolder'
        }
        const rowSpanSize = this.state.data[yearSem1].length > this.state.data[yearSem2].length ?
            ((this.state.data[yearSem1].length > 5) ? this.state.data[yearSem1].length : 5) :
            ((this.state.data[yearSem2].length > 5) ? this.state.data[yearSem2].length : 5)
        if (regex.test(this.state.data[yearSem1][0]) && regex.test(this.state.data[yearSem2][0])) {
            //Entire year which user will be or have went to special programmes (NOC/Exchange)
            return ([<tr>
                <th style={{verticalAlign: 'middle'}}>{"Year " + year}</th>
                <td style={spProgStyles}>{this.drawEmptyCell(this.state.data[yearSem1][0])}</td>
                <td style={spProgStyles}>{this.drawEmptyCell(this.state.data[yearSem2][0])}</td>
              </tr>,
              ]);
        } else if (regex.test(this.state.data[yearSem1][0])) {
            //sem1 of the year which user will be or have went to special programmes (NOC/Exchange)
            var result = [<tr>
                <th style={{verticalAlign: 'middle'}} rowSpan={rowSpanSize}>{"Year " + year}</th>
                <td style={spProgStyles} rowSpan={rowSpanSize}>{this.drawEmptyCell(this.state.data[yearSem1][0])}</td>
                <td style={{verticalAlign: 'middle'}}>{this.drawEmptyCell(this.state.data[yearSem2][0])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem2][1])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem2][2])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem2][3])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem2][4])}</td>
              </tr>
              ];
              for (var i = 5; i < rowSpanSize; i = i + 1) {
                  const tableRow =<tr>
                      <td>{this.drawEmptyCell(this.state.data[yearSem2][i])}</td>
                  </tr>
                  result.push(tableRow);
              }
              return result;
        } else if (regex.test(this.state.data[yearSem2][0])) {
            //sem2 of the year which user will be or have went to special programmes (NOC/Exchange)
            var result = [<tr>
                <th style={{verticalAlign: 'middle'}} rowSpan={rowSpanSize}>{"Year " + year}</th>
                <td>{this.drawEmptyCell(this.state.data[yearSem1][0])}</td>
                <td style={spProgStyles} rowSpan={rowSpanSize}>{this.drawEmptyCell(this.state.data[yearSem2][0])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem1][1])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem1][2])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem1][3])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem1][4])}</td>
              </tr>
              ];

              for (var i = 5; i < rowSpanSize; i = i + 1) {
                const tableRow = <tr>
                    <td>{this.drawEmptyCell(this.state.data[yearSem1][i])}</td>
                </tr>
                result.push(tableRow);
              }
              return result;
        } else {
            var result = [<tr>
                <th style={{verticalAlign: 'middle'}} rowSpan={rowSpanSize}>{"Year " + year}</th>
                <td>{this.drawEmptyCell(this.state.data[yearSem1][0])}</td>
                <td>{this.drawEmptyCell(this.state.data[yearSem2][0])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem1][1])}</td>
                  <td>{this.drawEmptyCell(this.state.data[yearSem2][1])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem1][2])}</td>
                  <td>{this.drawEmptyCell(this.state.data[yearSem2][2])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem1][3])}</td>
                  <td>{this.drawEmptyCell(this.state.data[yearSem2][3])}</td>
              </tr>,
              <tr>
                  <td>{this.drawEmptyCell(this.state.data[yearSem1][4])}</td>
                  <td>{this.drawEmptyCell(this.state.data[yearSem2][4])}</td>
              </tr>
              ];
              for (var i = 5; i < rowSpanSize; i = i + 1) {
                  const tableRow = <tr>
                    <td>{this.drawEmptyCell(this.state.data[yearSem1][i])}</td>
                    <td>{this.drawEmptyCell(this.state.data[yearSem2][i])}</td>
                  </tr>
                  result.push(tableRow);
              }
              return result;
        }
    }

    drawGraph() {
        this.state.config.node.viewGenerator = ((info) => <CustomNode info={info} addToTimeline={this.addToTimeline} removeFromTimeline={this.removeFromTimeline} findModule={this.findModule}/>);
        /*for (var node of this.state.data2.nodes) {
            var unlocked = true;
            for (var req of node.require) {
                if (!req.unlocked) {
                    unlocked = false;
                }
            }
            if (unlocked) {
                node.size = 800;
            } else {
                node.size = 600;
            }
        }*/
        var format = <div class="MODGrid">
                <Graph ref="graph" {...{
                    id: "graph",
                    data: this.state.data2,
                    config: this.state.config,
                    onClickNode: this.onClickNode,
                    onDoubleClickNode: this.onDoubleClickNode,
                    onClickGraph: this.onClickGraph
                }} />
            </div>;
        return format;
    }

    //User interaction with graph

    onClickNode = id => {
        var obj = null;
        for (var i = 0; i < this.state.data2.nodes.length; i = i + 1) {
            if (this.state.data2.nodes[i].id === id) {
                obj = this.state.data2.nodes[i];
                break;
            }
        }
        var willDisplayModal = true
        for (var i = 0; i < obj.require.length; i = i + 1) {
            if (!obj.require[i].unlocked) {
                willDisplayModal = false;
                break;
            }
        }
        if (!willDisplayModal) {
            this.setState(prevState => {
                return {
                    ...prevState,
                    showSpecialModal: obj
                }
            })
        } else {
            this.setState(prevState => {
                return {
                    data : prevState.data,
                    showModal : obj,
                    showTimeline: false,
                    showSidebar: false,
                    config: prevState.config,
                    data2: prevState.data2
                }
            })
        }
    };

    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div class={this.props.className}>
                <Modal isOpen={this.state.showModal === false ? false : true} toggle={this.toggleModal}>
                    {this.state.showModal === false ? null : this.showModal(this.state.showModal)}
                </Modal>
                <Modal isOpen={this.state.showSpecialModal === null ? false : true} toggle={this.specialToggle}>
                    {this.state.showSpecialModal === null ? null : this.showSpecialModal(this.state.showSpecialModal)}
                </Modal>
                <Topbar toggleTimeline={this.toggleTimeline} graphData={this.state.data2} getTimelineData={() => this.state.data} timelineData={this.state.data} addToTimeline={this.addToTimeline} removeFromTimeline={this.removeFromTimeline2}/>
                {this.state.isLoading ? null //(<div style={{display: 'flex', alignItems: 'center'}}><Spinner style={{ width: '100px', height: '100px' }} color="light" /></div>)
                : (<div class="MODGrid">
                    {this.drawGraph()}
                </div>)}
                <Modal isOpen={this.state.showTimeline} overlayClassName="modal-bg" toggle={this.toggleTimeline}>
                    {
                    this.state.showTimeline ?
                    <div>
                    <Table dark striped size="sm" bordered style={{margin: 0}}>
                        <thead>
                            <tr>
                                <th>Timeline</th>
                                <th>Semester 1</th>
                                <th>Semester 2</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.drawTable(1)}
                            {this.drawTable(2)}
                            {this.drawTable(3)}
                            {this.drawTable(4)}
                        </tbody>
                    </Table>
                    </div>
                    : null
                    }
                </Modal>
            </div>
        )
    }
}

export default Timeline;