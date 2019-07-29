import React from 'react';
import {Modal, Spinner, Label, DropdownItem, Input, Form, FormGroup, Button, TabContent, TabPane, Nav, NavLink, NavItem} from 'reactstrap';
import fb from '../../Config/config';
import classnames from 'classnames';
const nocDB = require('./NOCData.json');

//Abstracting out ideas for each component

class NOC extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false,
                NOCData: {
                place: null,
                year: null,
                semester: null,
                duration: null,
                codeString: null,
                internship: [null, null, null, null, null, null, null, null],
                entrepreneurship: [null, null, null, null],
                discipline: [null, null]
            },
            activeTab: '1',
            place: null,
            year: null,
            semester: null,
            duration: null,
            internship: [null, null, null, null, null, null, null, null],
            entrepreneurship: [null, null, null, null],
            discipline: [null, null]
        }
        this.toggleModal = this.toggleModal.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.setYear = this.setYear.bind(this);
        this.setSem = this.setSem.bind(this);
        this.showPlaces = this.showPlaces.bind(this);
        this.handleDurationChange = this.handleDurationChange.bind(this);
        this.handlePlaceSelectChange = this.handlePlaceSelectChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInternshipModuleChange = this.handleInternshipModuleChange.bind(this);
        this.handleDisciplineModuleChange = this.handleDisciplineModuleChange.bind(this);
        this.handleEntrepreneurshipModuleChange = this.handleEntrepreneurshipModuleChange.bind(this);
        this.handleDeletion = this.handleDeletion.bind(this);
    }

    componentDidMount() {
        //Reads NOC data from database. Bind it to this.state.NOCData
        //Changes to this component will call this.props.setNOC(updatedData)
        this.setState(prevState => {
            return {
                ...prevState,
                isLoading: true
            }
        });
        const userEmail = fb.auth().currentUser.email;
        var db = fb.firestore();
        db.collection('users').doc(userEmail).get().then(doc => {
            this.setState(prevState => {
                return {
                    ...prevState,
                    isLoading: false,
                    NOCData: doc.data().NOCData
                }
            })
        })
    }

    toggleModal() {
        this.setState(prevState => {
            if (prevState.isOpen) {
                return {
                    ...prevState,
                    isOpen: !prevState.isOpen,
                    activeTab: '1',
                    place: null,
                    year: null,
                    semester: null,
                    duration: null,
                    internship: [null, null, null, null, null, null, null, null],
                    entrepreneurship: [null, null, null, null],
                    discipline: [null, null]
                }
            } else {
                const newInternship = prevState.NOCData.internship.map(x => x);
                const newEntrepreneurship = prevState.NOCData.entrepreneurship.map(x => x);
                const newDiscipline = prevState.NOCData.discipline.map(x => x);
                return {
                    ...prevState,
                    isOpen: !prevState.isOpen,
                    activeTab: '1',
                    place: prevState.NOCData.place,
                    year: prevState.NOCData.year,
                    semester: prevState.NOCData.semester,
                    duration: prevState.NOCData.duration,
                    internship: newInternship,
                    entrepreneurship: newEntrepreneurship,
                    discipline: newDiscipline
                }
            }
        })
    }

    toggleTab(val) {
        this.setState(prevState => {
            return {
                ...prevState,
                activeTab: val
            }
        })
    }

    setSem(sem) {
        this.setState(prevState => {
            return {
                ...prevState,
                semester: sem
            }
        })
    }

    setYear(yr) {
        this.setState(prevState => {
            return {
                ...prevState,
                year: yr
            }
        })
    }

    showPlaces() {
        var result = [<option>{null}</option>];
        for (var place in nocDB) {
            const temp = <option>{place}</option>;
            result.push(temp);
        }
        return result;
    }

    handleDurationChange(e) {
        e.preventDefault();
        const durationChange = e.target.value;
        const newDuration = durationChange === "Short Programme" ? 1 : 2;
        this.setState(prevState => {
            return {
                ...prevState,
                duration: newDuration
            }
        })
    }

    handlePlaceSelectChange(e) {
        e.preventDefault();
        const placeName = e.target.value;
        console.log(placeName);
        this.setState(prevState => {
            return {
                ...prevState,
                place: placeName
            }
        })
    }

    handleInternshipModuleChange(e, num) {
        e.preventDefault();
        const val = e.target.value;
        this.setState(prevState => {
            prevState.internship[num] = val
            return {
                ...prevState
            }
        })
    }

    handleEntrepreneurshipModuleChange(e, num) {
        e.preventDefault();
        const val = e.target.value;
        this.setState(prevState => {
            prevState.entrepreneurship[num] = val
            return {
                ...prevState
            }
        })
    }

    handleDisciplineModuleChange(e, num) {
        e.preventDefault();
        const val = e.target.value;
        this.setState(prevState => {
            prevState.discipline[num] = val
            return {
                ...prevState
            }
        })
    }

    handleDeletion(e) {
        e.preventDefault();
        const modObj = {
            module: this.state.NOCData.codeString,
            added: [this.state.NOCData.year, this.state.NOCData.semester]
        }
        this.props.removeFromTimeline(modObj);
        if (this.state.NOCData.duration === 2) {
            const nextYrSem = this.state.NOCData.semester === 2 ? [(this.state.NOCData.year + 1), 1]
                : [this.state.NOCData.year, 2];

            const modObj2 = {
                module: this.state.NOCData.codeString,
                added: nextYrSem
            }
            this.props.removeFromTimeline(modObj2);            
        }
        this.setState(prevState => {
            const initNOCData = {
                place: null,
                year: null,
                semester: null,
                duration: null,
                codeString: null,
                internship: [null, null, null, null, null, null, null, null],
                entrepreneurship: [null, null, null, null],
                discipline: [null, null]
            }
            this.props.setNOC(initNOCData);
            return {
                isOpen: false,
                NOCData: initNOCData,
                activeTab: '1',
                duration: null,
                place: null,
                year: null,
                semester: null
            }
        })
    }

    handleSubmit(e) {
        //Saves data into database
        e.preventDefault();
        const place = e.target.place.value;
        const year = this.state.year;
        const sem = this.state.semester;
        const duration = this.state.duration;
        /*
        Default values when no input is read from user
        console.log(place === '');
        console.log(year === null);
        console.log(sem === null);
        */
        if ((place === '') || (year === null) || (sem === null)) {
            alert('Please fill in all the fields before pressing update!');
            return;
        }
        const yearSem = 'y' + year + 's' + sem;
        const nxtys = sem === 2 ? [year + 1, 1] : [year, 2];
        const nextYrSem = 'y' + nxtys[0] + 's' + nxtys[1];
        const regex = /NOC/;
        if ((this.props.timelineData[yearSem][0] !== undefined) && (!regex.test(this.props.timelineData[yearSem][0]))) {
            console.log(this.props.timelineData[yearSem][0]);
            alert('You are already taking NUS modules during that period. Please remove all modules that you are taking for that period in order to add NOC data');
            return;
        } else if ((duration === 2) && (this.props.timelineData[nextYrSem][0] !== undefined) && (!regex.test(this.props.timelineData[nextYrSem][0]))) {
            console.log(this.props.timelineData[yearSem][0]);
            alert('You are already taking NUS modules during that period. Please remove all modules that you are taking for that period in order to add NOC data');
            return;
        } else {
            if (this.state.NOCData.codeString !== null) {
                const modObj = {
                    module: this.state.NOCData.codeString,
                    added: [this.state.NOCData.year, this.state.NOCData.semester]
                }
                const modObj2 = {
                    module: this.state.NOCData.codeString,
                    added: nxtys
                }
                console.log(modObj);
                this.props.removeFromTimeline(modObj);
                this.props.removeFromTimeline(modObj2);
            }
            const string = "NOC @ " + place;
            this.props.addToTimeline(string, year, sem);
            if (duration === 2) {
                this.props.addToTimeline(string, nxtys[0], nxtys[1]);
            }
            this.setState(prevState => {
                var newNOCData = {
                    place: place,
                    year: year,
                    semester: sem,
                    duration: duration,
                    codeString: string,
                    internship: prevState.internship,
                    entrepreneurship: prevState.entrepreneurship,
                    discipline: prevState.discipline
                }
                this.props.setNOC(newNOCData);
                return {
                    ...prevState,
                    NOCData: newNOCData,
                    isOpen: false
                }
            })
        }
    }

    render() {
        return (
            [
                <DropdownItem onClick={this.toggleModal}>
                    NOC
                </DropdownItem>,
                <div>
                {this.state.isLoading ? <div style={{width: '100vw', height: '100vh', position:'absolute', background:'rgba(0,0,0,0.3)'}}>
                    <Spinner />
                </div> : null}
                <Modal isOpen={this.state.isOpen} toggle={this.toggleModal}>
                    <div> <div style={{textAlign: 'left', margin: '20px', fontSize:"18px", fontWeight: 'bold'}}>NOC</div>
                    <Nav tabs style={{textAlign: 'left', fontSize: '15px'}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => this.toggleTab('1')}>
                                Guide
                            </NavLink>                        
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => this.toggleTab('3')}>
                                Edit
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab} style={{textAlign: 'left', fontSize: '15px', fontWeight: 'normal'}}>
                        <TabPane tabId='1'>
                        <Form style={{textAlign: 'left', margin: '20px'}}>
                            <FormGroup style={{fontSize: '15px', fontWeight: 'bold'}}>NOC programme info</FormGroup>
                            <hr></hr>
                            <FormGroup>
                                <div>Not sure how NOC works? Click and read up on the guide below</div> <br></br>
                                <Button color="link" onClick={()=> {window.open("https://enterprise.nus.edu.sg/educate/nus-overseas-colleges/apply/application-info")}}>Comprehensive NOC application information</Button>
                                <br></br>
                                <Button color="link" onClick={()=> {window.open("https://enterprise.nus.edu.sg/educate/nus-overseas-colleges/programmes")}}>NOC Overview</Button>
                                <br></br>
                                <Button color="link" onClick={()=> {window.open("https://enterprise.nus.edu.sg/educate/nus-overseas-colleges/programmes/curriculum-overview")}}>Module mapping info</Button>
                                <br></br>
                                <Button color="link" onClick={()=> {window.open("https://nocapplication.nus.edu.sg/")}}>NOC Application Portal</Button>
                                <hr></hr>
                                <div> <div style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '10px'}}>-TLDR-</div>
                                    <ul>Requirements:
                                        <li>Students must have completed CS2103/IS2103/BT2101/CS2113 modules (for SoC & CEG students only).</li>
                                        <li>For most NOC programmes: Students should have individually gained about 70-80 modular credits at the point of departure and MUST have at least one remaining semester of study upon return to NUS without exceeding their maximum candidature.</li>
                                        <li>For NOC Singapore and NOC SE Asia: Students should have completed 2 semesters of study and/or individually gained about 40 modular credits at the start of the internship.</li>
                                    </ul>
                                    <ul>Application info:
                                        <li>Students are required to prepare a Curriculum vitae (CV), an Essay of not more than 300 words about why you make a good candidature
                                             for the programme, NUS Unofficial Transcript (EduRec) and at least 2 recommendation letters/ testimonials
                                        </li>
                                        <li>Refer to application info for the application periods</li>
                                    </ul>
                                    <ul>Modular credits from NOC:
                                        <li>Full year programmes: 48MCs (spans over 2 semesters)</li>
                                        <li>Short Programmes: 24-28MCs (spans over 1 semester)</li>
                                        <li>Each NOC programme is split into: Internship(up to 28MCs), Entrepreneurship Courses(up to 14MCs) and Discipline-based Courses(up to 8MCs)</li>
                                    </ul>
                                </div>
                            </FormGroup>
                        </Form>
                        </TabPane>
                        <TabPane tabId='3'>
                        <Form style={{margin: '20px'}} onSubmit={this.handleSubmit}>
                        <FormGroup style={{fontSize: '15px', fontWeight: 'bold'}}>Edit your NOC programme</FormGroup>
                            <hr></hr>
                            <FormGroup>
                                Select which place you are going for NOC:
                                <Input type="select" name="place" value={this.state.place} onChange={this.handlePlaceSelectChange}>{this.showPlaces()}</Input>
                            </FormGroup>
                            <FormGroup>
                                Select the period when your NOC begins:
                            </FormGroup>
                            <div style={{display: 'grid', width: '100%', gridTemplateColumns: '1fr 1fr'}}>
                                <div>
                                    <div>Year:</div>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="year" 
                                        onClick={() => this.setYear(1)} 
                                        checked={this.state.year === 1}/>{' '}
                                        1
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="year" onClick={() => this.setYear(2)}
                                        checked={this.state.year === 2}/>{' '}
                                        2
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="year" onClick={() => this.setYear(3)}
                                        checked={this.state.year === 3}/>{' '}
                                        3
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="year" onClick={() => this.setYear(4)}
                                        checked={this.state.year === 4}/>{' '}
                                        4
                                        </Label>
                                    </FormGroup></div>
                                <div>
                                    <div>Semester: </div>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="semester" onClick={() => this.setSem(1)}
                                        checked={this.state.semester === 1}/>{' '}
                                        1
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="semester" onClick={() => this.setSem(2)}
                                        checked={this.state.semester === 2}/>{' '}
                                        2
                                        </Label>
                                    </FormGroup></div>
                            </div>
                            <hr></hr>
                            <FormGroup>
                                Select the duration of your NOC programme:
                            </FormGroup>
                            <FormGroup>
                                <Input type="select" name="duration" onChange={this.handleDurationChange} value={this.state.duration === null ? null : this.state.duration === 1 ? "Short Programme" : "Full year Programme"}>
                                    <option>Short Programme</option>
                                    <option>Full year Programme</option>
                                </Input>
                            </FormGroup>
                            <hr></hr>
                            <FormGroup>Module Mapping: (You can update this later)</FormGroup>
                            <FormGroup>Internship (Up to 28MCs)</FormGroup>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px'}}>
                                <Input type="text" name="internship1" value={this.state.internship[0]} onChange={e=>this.handleInternshipModuleChange(e, 0)}></Input>
                                <Input type="text" name="internship2" value={this.state.internship[1]} onChange={e=>this.handleInternshipModuleChange(e, 1)}></Input>
                                <Input type="text" name="internship3" value={this.state.internship[2]} onChange={e=>this.handleInternshipModuleChange(e, 2)}></Input>
                                <Input type="text" name="internship4" value={this.state.internship[3]} onChange={e=>this.handleInternshipModuleChange(e, 3)}></Input>
                                <Input type="text" name="internship5" value={this.state.internship[4]} onChange={e=>this.handleInternshipModuleChange(e, 4)}></Input>
                                <Input type="text" name="internship6" value={this.state.internship[5]} onChange={e=>this.handleInternshipModuleChange(e, 5)}></Input>
                                <Input type="text" name="internship7" value={this.state.internship[6]} onChange={e=>this.handleInternshipModuleChange(e, 6)}></Input>
                                <Input type="text" name="internship8" value={this.state.internship[7]} onChange={e=>this.handleInternshipModuleChange(e, 7)}></Input>
                            </div>
                            <FormGroup>Entrepreneurship (Up to 14MCs)</FormGroup>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px'}}>
                                <Input type="text" name="entrepreneurship1" value={this.state.entrepreneurship[0]} onChange={e=>this.handleEntrepreneurshipModuleChange(e, 0)}></Input>
                                <Input type="text" name="entrepreneurship2" value={this.state.entrepreneurship[1]} onChange={e=>this.handleEntrepreneurshipModuleChange(e, 1)}></Input>
                                <Input type="text" name="entrepreneurship3" value={this.state.entrepreneurship[2]} onChange={e=>this.handleEntrepreneurshipModuleChange(e, 2)}></Input>
                                <Input type="text" name="entrepreneurship4" value={this.state.entrepreneurship[3]} onChange={e=>this.handleEntrepreneurshipModuleChange(e, 3)}></Input>
                            </div>
                            <FormGroup>Discipline (Up to 8MCs)</FormGroup>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px'}}>
                                <Input type="text" name="discipline1" value={this.state.discipline[0]} onChange={e=>this.handleDisciplineModuleChange(e, 0)}></Input>
                                <Input type="text" name="discipline2" value={this.state.discipline[1]} onChange={e=>this.handleDisciplineModuleChange(e, 1)}></Input>
                            </div>
                            <hr></hr>
                            <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gridGap: '20px'}}>
                                <Button type="submit">Update!</Button>
                                {this.state.NOCData.place === null ? null : <Button color="danger" onClick={this.handleDeletion}>Delete</Button>}
                            </div>
                        </Form>
                        </TabPane>
                    </TabContent>
                    </div>
                </Modal>
                </div>
            ]
        )
    }
}

export default NOC;