import React from 'react';
import {Modal, Label, Spinner, DropdownItem, Input, Form, FormGroup, Button, TabContent, TabPane, Nav, NavLink, NavItem} from 'reactstrap';
import fb from '../../Config/config';
import classnames from 'classnames';
const exchangeDB = require('./ExchangeData.json');
//Abstracting out ideas for each component

class Exchange extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false,
            exchangeData: {
                country: null,
                school: null,
                year: null,
                semester: null,
                codeString: null,
                moduleMapping: []
            },
            activeTab: '1',
            country: null,
            school: null,
            year: null,
            semester: null,
            v: []
        }
        this.toggleModal = this.toggleModal.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.setYear = this.setYear.bind(this);
        this.setSem = this.setSem.bind(this);
        this.showCountries = this.showCountries.bind(this);
        this.showSchools = this.showSchools.bind(this);
        this.handleCountrySelectChange = this.handleCountrySelectChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleModuleMapChange = this.handleModuleMapChange.bind(this);
        this.handleSchoolSelectChange = this.handleSchoolSelectChange.bind(this);
        this.handleDeletion = this.handleDeletion.bind(this);
    }

    componentDidMount() {
        //Reads exchange data from database. Bind it to this.state.exchangeData
        //Changes to this component will call this.props.setExchange(updatedData)
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
                    exchangeData: doc.data().exchangeData
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
                    country: null,
                    school: null,
                    year: null,
                    semester: null,
                    v: []
                }
            } else {
                const newV = prevState.exchangeData.moduleMapping.map(x => x);
                return {
                    ...prevState,
                    isOpen: !prevState.isOpen,
                    activeTab: '1',
                    country: prevState.exchangeData.country,
                    school: prevState.exchangeData.school,
                    year: prevState.exchangeData.year,
                    semester: prevState.exchangeData.semester,
                    v: newV
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

    showCountries() {
        var result = [<option>{null}</option>];
        for (var country in exchangeDB) {
            const temp = <option>{country}</option>;
            result.push(temp);
        }
        return result;
    }

    showSchools() {
        var result = [<option>{null}</option>];
        if (this.state.country === null) {
            return result;
        } else {
            var schools = exchangeDB[this.state.country];
            for (var school of schools) {
                const temp = <option>{school}</option>
                result.push(temp);
            }
            return result;
        }
    }

    handleCountrySelectChange(e) {
        e.preventDefault();
        const countryName = e.target.value;
        console.log(countryName);
        this.setState(prevState => {
            return {
                ...prevState,
                country: countryName
            }
        })
    }

    handleModuleMapChange(e, num) {
        e.preventDefault();
        const val = e.target.value;
        this.setState(prevState => {
            prevState.v[num] = val
            return {
                ...prevState
            }
        })
    }

    handleSchoolSelectChange(e) {
        e.preventDefault();
        const val = e.target.value;
        this.setState(prevState => {
            return {
                ...prevState,
                school: val
            }
        })
    }

    handleDeletion(e) {
        e.preventDefault();
        const modObj = {
            module: this.state.exchangeData.codeString,
            added: [this.state.exchangeData.year, this.state.exchangeData.semester]
        }
        this.props.removeFromTimeline(modObj);
        this.setState(prevState => {
            const initExchangeData = {
                country: null,
                school: null,
                year: null,
                semester: null,
                codeString: null,
                moduleMapping: []
            }
            this.props.setExchange(initExchangeData);
            return {
                isOpen: false,
                exchangeData: initExchangeData,
                activeTab: '1',
                country: null,
                school: null,
                year: null,
                semester: null
            }
        })
    }

    handleSubmit(e) {
        //Saves data into database
        e.preventDefault();
        const country = e.target.country.value;
        const school = e.target.school.value;
        const year = this.state.year;
        const sem = this.state.semester;
        /*
        Default values when no input is read from user
        console.log(country === '');
        console.log(school === '');
        console.log(year === null);
        console.log(sem === null);
        */
        if ((country === '') || (school === '') || (year === null) || (sem === null)) {
            alert('Please fill in all the fields before pressing update!');
            return;
        }
        const yearSem = 'y' + year + 's' + sem;
        if ((this.props.timelineData[yearSem][0] !== undefined)) {
            console.log(this.props.timelineData[yearSem][0]);
            alert('You are already taking NUS modules during that period. Please remove all modules that you are taking for that period in order to add Exchange data');
        } else {
            if (this.state.exchangeData.codeString !== null) {
                const modObj = {
                    module: this.state.exchangeData.codeString,
                    added: [this.state.exchangeData.year, this.state.exchangeData.semester]
                }
                console.log(modObj);
                this.props.removeFromTimeline(modObj);
            }
            const string = "Exchange @ " + school + " (" + country + ")";
            this.props.addToTimeline(string, year, sem);
            this.setState(prevState => {
                var newExchangeData = {
                    country: country,
                    school: school,
                    year: year,
                    semester: sem,
                    codeString: string,
                    moduleMapping: prevState.v
                }
                this.props.setExchange(newExchangeData);
                return {
                    ...prevState,
                    exchangeData: newExchangeData,
                    isOpen: false
                }
            })
        }
    }

    render() {
        return (
            [
                <DropdownItem onClick={this.toggleModal}>
                    Exchange
                </DropdownItem>,
                <div>
                {this.state.isLoading ? <div style={{width: '100vw', height: '100vh', position:'absolute', background:'rgba(0,0,0,0.3)'}}>
                    <Spinner />
                </div> : null}
                <Modal isOpen={this.state.isOpen} toggle={this.toggleModal}>
                    <div> <div style={{textAlign: 'left', margin: '20px', fontSize:"18px", fontWeight: 'bold'}}>Exchange</div>
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
                            <FormGroup style={{fontSize: '15px', fontWeight: 'bold'}}>Exchange programme info</FormGroup>
                            <hr></hr>
                            <FormGroup>
                                <div>Not sure how exchange works? Click and read up on the guide below</div> <br></br>
                                <Button color="link" onClick={()=> {window.open("http://www.nus.edu.sg/gro/assets/doc/prog/sep/nus_sep_information_sheet.pdf")}}>Comprehensive exchange application information</Button>
                                <br></br>
                                <Button color="link" onClick={()=> {window.open("http://www.nus.edu.sg/gro/student-exchange.php")}}>Partnering Universities</Button>
                                <br></br>
                                <Button color="link" onClick={()=> {window.open("http://www.nus.edu.sg/registrar/info/info/Non-Graduating-Module-Restrictions.pdf")}}>Module Restrictions</Button>
                                <br></br>
                                <hr></hr>
                                <div> <div style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '10px'}}>-TLDR-</div>
                                    <ul>Requirements:
                                        <li>Completed at least 1 year of study in NUS</li>
                                        <li>No grade below "C" for any modules that have been undertaken</li>
                                        <li>Have sufficient financial means to pay for living expenses</li>
                                    </ul>
                                    <ul>Application period:
                                        <li>Generally there are several rounds of application, with the first round beginning approximately 1 year before the
                                            exchange period starts. (Refer to Partnering Universities -> Outgoing Exchangers -> Step 6: SEP Application for the precise dates)</li>
                                        <li>Apply via myedurec website</li>
                                    </ul>
                                    <ul>Modules taken in partnered university:
                                        <li>Modules (including module mapping) that are taken outside NUS are approved by your NUS faculty/department</li>
                                        <li>You must read a minimum of 12MCs worth of subjects</li>
                                    </ul>
                                </div>
                            </FormGroup>
                        </Form>
                        </TabPane>
                        <TabPane tabId='3'>
                        <Form style={{margin: '20px'}} onSubmit={this.handleSubmit}>
                        <FormGroup style={{fontSize: '15px', fontWeight: 'bold'}}>Edit your exchange programme</FormGroup>
                            <hr></hr>
                            <FormGroup>
                                Select which country you are going for exchange:
                                <Input type="select" name="country" value={this.state.country} onChange={this.handleCountrySelectChange}>{this.showCountries()}</Input>
                            </FormGroup>
                            <FormGroup>
                                Select the school where you will be going for exchange:
                                <Input type="select" name="school" value={this.state.school} onChange={this.handleSchoolSelectChange}>{this.showSchools()}</Input>
                            </FormGroup>
                            <FormGroup>
                                Select the period when you are going:
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
                            <FormGroup>Module Mapping: (You can update this later)</FormGroup>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px'}}>
                                <div>Partnering university module:</div>
                                <div>Equivalent to which NUS module:</div>
                                <Input type="text" name="pu1" value={this.state.v[0]} onChange={e=>this.handleModuleMapChange(e, 0)}></Input>
                                <Input type="text" name="nus1" value={this.state.v[1]} onChange={e=>this.handleModuleMapChange(e, 1)}></Input>
                                <Input type="text" name="pu2" value={this.state.v[2]} onChange={e=>this.handleModuleMapChange(e, 2)}></Input>
                                <Input type="text" name="nus2" value={this.state.v[3]} onChange={e=>this.handleModuleMapChange(e, 3)}></Input>
                                <Input type="text" name="pu3" value={this.state.v[4]} onChange={e=>this.handleModuleMapChange(e, 4)}></Input>
                                <Input type="text" name="nus3" value={this.state.v[5]} onChange={e=>this.handleModuleMapChange(e, 5)}></Input>
                                <Input type="text" name="pu4" value={this.state.v[6]} onChange={e=>this.handleModuleMapChange(e, 6)}></Input>
                                <Input type="text" name="nus4" value={this.state.v[7]} onChange={e=>this.handleModuleMapChange(e, 7)}></Input>
                                <Input type="text" name="pu5" value={this.state.v[8]} onChange={e=>this.handleModuleMapChange(e, 8)}></Input>
                                <Input type="text" name="nus5" value={this.state.v[9]} onChange={e=>this.handleModuleMapChange(e, 9)}></Input>
                                <Input type="text" name="pu6" value={this.state.v[10]} onChange={e=>this.handleModuleMapChange(e, 10)}></Input>
                                <Input type="text" name="nus6" value={this.state.v[11]} onChange={e=>this.handleModuleMapChange(e, 11)}></Input>
                            </div>
                            <hr></hr>
                            <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gridGap: '20px'}}>
                                <Button type="submit">Update!</Button>
                                {this.state.exchangeData.country === null ? null : <Button color="danger" onClick={this.handleDeletion}>Delete</Button>}
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

export default Exchange;