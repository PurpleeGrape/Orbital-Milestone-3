import React from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Modal,
    Button,
    Spinner
   } from 'reactstrap';
import fb from '../../Config/config';
import NOC from '../Programme/NOC';
import Exchange from '../Programme/Exchange';
import Internship from '../Programme/Internship';
import CourseInfo from './CourseInfo';
import CustomModule from './CustomModule';
import PlaNUSIcon from '../../../Images/PlaNUSIcon2.png';
import axios from 'axios';
import { saveAs } from 'file-saver';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);
    
        this.toggle = this.toggle.bind(this);
        this.handleSignOut = this.handleSignOut.bind(this);
        this.handleSaveEvent = this.handleSaveEvent.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.toggleSignOutModal = this.toggleSignOutModal.bind(this);
        this.setNOC = this.setNOC.bind(this);
        this.setExchange = this.setExchange.bind(this);
        this.setFocusArea = this.setFocusArea.bind(this);
        this.setCustomModule = this.setCustomModule.bind(this);
        this.state = {
          isOpen: false,
          NOCData: null,
          exchangeData: {
            country: null,
            school: null,
            year: null,
            semester: null,
            codeString: null,
            moduleMapping: []
          },
          focusAreaData: null,
          customModule: null,
          openSignOutModal: false
        };
    }

    componentDidMount() {
      this.setState(prevState => {
        return {
          ...prevState,
          isLoading: true
        }
      })
      const userEmail = fb.auth().currentUser.email;
      var db = fb.firestore();
      db.collection('users').doc(userEmail).get().then(doc => {
        if (!doc.exists) {
          console.log('Error retrieving user data from database');
        } else {
          const userPrevInfo = doc.data();
          this.setState(prevState => {
            return {
              ...prevState,
              isLoading: false,
              exchangeData: userPrevInfo.exchangeData,
              NOCData: userPrevInfo.NOCData,
              customModule: userPrevInfo.customModule
            }
          })
        }
      });
    }

    toggle() {
        this.setState(prevState => {
            return {
              ...prevState,
              isOpen: !prevState.isOpen
            }
        });
    }

    toggleSignOutModal() {
      this.setState(prevState => {
        return {
          ...prevState,
          openSignOutModal: !prevState.openSignOutModal
        }
      })
    }

    handleSignOut() {
        fb.auth().signOut();
    }

    handleExport(timelineData) {
      var counter = 5;
      for (var arr in timelineData) {
        if (timelineData[arr].length > counter) {
          counter = timelineData[arr].length;
        }
      }
      console.log(counter);
      var data = {
        timelineData: timelineData,
        maxCount: counter
      }
      axios.post('/create-pdf', data)
      .then(() => axios.get('fetch-pdf', {responseType: 'blob'}))
      .then((res) => {
        const pdfBlob = new Blob([res.data], {type: 'application/pdf'});
        saveAs(pdfBlob, 'timeline.pdf');
      });
    }

    handleSaveEvent() {
      this.setState(prevState => {
        return {
          ...prevState,
          isLoading: true
        }
      });
      const userEmail = fb.auth().currentUser.email;
      var firestoreDatabase = fb.firestore();
      firestoreDatabase.collection('users').doc(userEmail).get().then(doc => {
        if (!doc.exists) {
          console.log('Document does not exists');
        } else {
          var userPrevInfo = doc.data();
          var updatedData = {
            email: userPrevInfo.email,
            course: userPrevInfo.course,
            timelineData: this.props.timelineData,
            graphData: this.props.graphData,
            exchangeData: this.state.exchangeData,
            NOCData: this.state.NOCData,
            customModule: this.state.customModule
          }
          firestoreDatabase.collection('users').doc(userEmail).set(updatedData);
          this.setState(prevState => {
            return {
              ...prevState,
              isLoading: false
            }
          });
          alert('Saved successfully!');
        }
      }).catch(err => { console.log('Error retrieving data from database')});
    }

    /*
    ... syntax sugar to copy state objects!
    fakeSaveButton() {
      this.setState(prevState => {
        return {
          ...prevState,=> Copies all attributes of prevState
          internship: true, => Overwrites prevState's internship attribute
          focusArea: true
        }
      })
    }
    */

    setFocusArea(obj) {
      this.setState(prevState => {
        return {
          ...prevState,
          focusAreaData: obj
        }
      })
    }

    setExchange(obj) {
      this.setState(prevState => {
        return {
          ...prevState,
          exchangeData: obj
        }
      })
    }

    setNOC(obj) {
      this.setState(prevState => {
        return {
          ...prevState,
          NOCData: obj
        }
      })
    }

    setCustomModule(obj) {
      this.setState(prevState => {
        return {
          ...prevState,
          customModule: obj
        }
      })
    }

    render() {
        return (
          <div class="Topbar" style={{width: "100%"}}>
            <Modal isOpen={this.state.openSignOutModal} toggle={this.toggleSignOutModal}>
              <div style={{margin: '20px', fontSize: '20px', fontWeight: 'bold', fontFamily: 'Arial', textAlign: 'center'}}>
                Remember to save your plan before signing out! <br></br>
                <Button color="danger" onClick={this.handleSignOut} style={{width: '30%', margin: '10px'}}>Get me out of here!</Button>  
              </div>
            </Modal>
            {this.state.isLoading ? <div style={{display: 'grid', position: 'absolute', width: '100vw', height: '100vh', alignItems: 'center', justifyItems: 'center', background: 'rgba(0,0,0,0.5)'}}><Spinner style={{width: '100px', height: '100px'}} color="light" /></div> : null}
            <Navbar color="light" light expand="md">
              <div style={{position: "absolute", maxHeight: "56px", marginLeft: "-10px", cursor: "pointer"}} title="Click to reset to the previous saved point!" onClick={() => window.location.reload()}><img src={PlaNUSIcon} alt="PlaNUS" height="56"></img></div>
              <NavbarToggler onClick={this.toggle} />
              <Collapse isOpen={this.state.isOpen} navbar>
                <Nav className="ml-auto" navbar>
                  <NavItem>
                    <NavLink style={{cursor: "pointer"}} onClick={this.props.toggleTimeline}>Timeline</NavLink>
                  </NavItem>
                  <CustomModule setCustomModule={this.setCustomModule} addToTimeline={this.props.addToTimeline} timelineData={this.props.timelineData} removeFromTimeline={this.props.removeFromTimeline}/>
                  <NavItem style={{cursor: "pointer"}}>
                    <NavLink onClick={this.handleSaveEvent}>Save</NavLink>
                  </NavItem>
                  <CourseInfo />
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret>
                      Special Programmes
                    </DropdownToggle>
                    <DropdownMenu right>
                      <NOC timelineData={this.props.timelineData} addToTimeline={this.props.addToTimeline} removeFromTimeline={this.props.removeFromTimeline}
                      setNOC={this.setNOC}/>
                      <DropdownItem divider />
                      <DropdownItem onClick={()=>alert('Coming soon!')}>
                        Research
                      </DropdownItem>
                      <DropdownItem divider />
                      <Exchange timelineData={this.props.timelineData} addToTimeline={this.props.addToTimeline} removeFromTimeline={this.props.removeFromTimeline}
                      setExchange={this.setExchange}/>
                      <DropdownItem divider />
                      <Internship />
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret>
                      Settings
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem>
                        Profile
                      </DropdownItem>
                      <DropdownItem onClick={() => window.open("https://drive.google.com/open?id=1XvQvraVDYOPObdIklcQc20F22QAD3NOb_j_3YNrFUJs")}>
                        Help
                      </DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem onClick={() => this.handleExport(this.props.timelineData)}>
                        Export Timeline
                      </DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem onClick={this.toggleSignOutModal}>
                        Sign Out
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </Nav>
              </Collapse>
            </Navbar>
          </div>
        );
    }
}