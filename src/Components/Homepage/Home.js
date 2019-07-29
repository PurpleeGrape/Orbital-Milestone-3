import React from 'react';
import { Modal, Button, Form, FormGroup, Label, Input, FormText, Spinner } from 'reactstrap';
import Timeline from '../Planning/Timeline/Timeline';
import fb from '../Config/config';
import setup from './Setup';
import PlaNUSLogo from '../../Images/PlaNUSIcon2.png';
import Data from '../Planning/Timeline/Data';
import { getGraphData } from '../Data/initData';
const MajReqData = require('../Data/MajReqData.json');

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            openSignUpForm: false,
        }

        this.toggleSignUpForm = this.toggleSignUpForm.bind(this);
        this.getModalContent = this.getModalContent.bind(this);
        this.handleSignUp = this.handleSignUp.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.showMajors = this.showMajors.bind(this);
    }
    
    authListener() {
        fb.auth().onAuthStateChanged(user => {
            if (user) {
                this.setState(prevState => {
                    return {
                        user: user,
                        openSignUpForm: false
                    }
                })
            } else {
                this.setState(prevState => {
                    return {
                        user: null,
                        openSignUpForm: false
                    }
                })
            }
        })
    }

    componentDidMount() {
        this.authListener();
    }

    toggleSignUpForm() {
        this.setState(prevState => {
            return {
                user: null,
                openSignUpForm: !prevState.openSignUpForm,
                showMajors: null,
                isLoading: false
            }
        })
    }
    
    handleLogin(e) {
        const email = e.target.loginEmail.value;
        const password = e.target.loginPassword.value;
        this.setState(prevState => {
            return {
                ...prevState,
                isLoading: true
            }
        })
        fb.auth().signInWithEmailAndPassword(email, password).then(u => {
            this.setState({
                user: [email, password],
                isLoading: false
            })
        }).catch(error => {
            alert('We could not log you into our server. You may have keyed in the wrong username or password');
            console.log(error);
            this.setState(prevState => {
                return {
                    ...prevState,
                    isLoading: false
                }
            })
        });
        e.preventDefault();
    }

    handleSignUp(e) {
        const email = e.target.signUpEmail.value;
        const password = e.target.signUpPassword.value;
        const faculty = e.target.select.value;
        const major = e.target.selectMajor.value;
        const additionalModules = e.target.additionalMods.value;
        console.log(additionalModules);
        e.preventDefault();
        this.setState(prevState => {
            return {
                ...prevState,
                isLoading: true
            }
        });
        const res = () => {this.setState(prevState => {
            return {
                ...prevState,
                isLoading: false
            }
        })}
        const rej = () => {this.setState(prevState => {
            return {
                ...prevState,
                user: null,
                isLoading: false
            }
        })}

        //Submit data into firebase
        setup(email, faculty, major, additionalModules).then(u => {
            console.log(email + " database has been initialised");
            fb.auth().createUserWithEmailAndPassword(email, password).then(v => {
                console.log(email + " account has been created");
                res();
            }).catch(t => {
                alert('Email is already in use. :(( Please signup with another email address!');
                rej();
            })
        }).catch(err => {
            console.log(email + " failed to initialise in database");
        })
        /*fb.auth().createUserWithEmailAndPassword(email, password).then(u => {
            
            setup(email, faculty, major, additionalModules, res, rej);
            }).catch(error => {
            this.setState(prevState => {
                return {
                    ...prevState,
                    user: null,
                    isLoading: false
                }
            });
            alert('Email is already in use. :(( Please signup with another email address!');
        });*/
    }

    showMajors(e) {
        const faculty = e.target.value;
        e.preventDefault();
        var facultyDatabase = fb.firestore().collection('faculty');
        const docType = faculty === "Faculty of Arts & Social Science" ? "arts"
                      : faculty === "Faculty of Engineering" ? "engineering"
                      : faculty === "NUS Business School" ?  "business"
                      : faculty === "Faculty of Science" ? "science"
                      : faculty === "School of Computing" ? "computing" : 'arts';
        this.setState(prevState => {
            return {
                ...prevState,
                isLoading: true
            }
        })
    
        var getDoc = facultyDatabase.doc(docType).get()
            .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                console.log('Document data:', doc.data().major);
                var majors = doc.data().major.map(maj => {
                    return <option>{maj}</option>
                });
                this.setState(prevState => {
                    return {
                        user: prevState.user,
                        openSignUpForm: true,
                        showMajors: majors,
                        isLoading: false
                    }
                })
            }
            })
            .catch(err => {
            console.log('Error getting document', err);
            });
    }

    getModalContent() {
        return (
        <Form style={{textAlign: 'left', margin: 20}} onSubmit={e => this.handleSignUp(e)}>
            {this.state.isLoading ? <div class="LoadingPage" style={{margin: '-20px'}}><Spinner style={{width: "100px", height: "100px"}} color="primary"></Spinner></div> : null}
            <div style={{fontSize: 20, marginBottom: 15, fontWeight: 'bold'}}>Registration page</div>
            <hr></hr>
            <FormGroup>
                <Label for="signUpEmail">Email</Label>
                <Input type="email" name="signUpEmail" id="signUpEmail" placeholder="Example@u.nus.edu" />
            </FormGroup>
            <FormGroup>
                <Label for="signUpPassword">Password</Label>
                <Input type="password" name="signUpPassword" id="signUpPassword" placeholder="Example password" />
            </FormGroup>
            <FormGroup>
                <Label for="facultySelect">Select the faculty you are from</Label>
                <Input type="select" name="select" id="facultySelect" onChange={e => this.showMajors(e)}>
                    <option>{null}</option>
                    <option>Faculty of Science</option>
                    <option>School of Computing</option>
                    <option disabled style={{color: 'rgba(230,230,230)'}} title="Under Development">Faculty of Arts & Social Science</option>
                    <option disabled style={{color: 'rgba(230,230,230)'}} title="Under Development">Faculty of Engineering</option>                    
                    <option disabled style={{color: 'rgba(230,230,230)'}} title="Under Development">NUS Business School</option>
                </Input>
            </FormGroup>
            <FormGroup>
                <Label for="facultySelect">Select the major you are in</Label>
                <Input type="select" name="selectMajor" id="selectMajor">
                    {this.state.showMajors}
                </Input>
            </FormGroup>
            <hr></hr>
            <FormGroup>
                <Label for="additionalMods">Key in any unrestricted electives or general education modules you are keen on taking.</Label>
                <div style={{marginTop: '-10px', color: 'rgba(200,200,200)'}}>(example: GER1000 GEH1036...)</div>
                <Input type="text" name="additionalMods" id="additionalMods"></Input>
            </FormGroup>
            <FormGroup>
                <Button type="submit">Submit</Button>
            </FormGroup>
        </Form>
        );
    }

    render() {
        //fb.auth().signOut();
        if ((this.state.user === null) || this.state.isLoading){
            return (
                <div class="Home" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', height: '100vh'}}>
                    <Modal isOpen={this.state.openSignUpForm} toggle={this.toggleSignUpForm}>{this.getModalContent()}</Modal>
                    <div style ={{position:'absolute', alignItems: 'center', justifyContent: 'center', display: 'flex', height: "15%", width:"100%", background: 'white'}}><img src={PlaNUSLogo} alt="nil" height="100%" borderRadius="5px"></img></div>
                    {this.state.isLoading ? <div class="LoadingPage"><Spinner style={{width: "100px", height: "100px"}} color="primary"></Spinner></div> : null}
                    <div style={{margin: 0, background: 'rgba(200,200,200)', borderRadius: 5, gridColumn: 2, gridRow: 2}}>
                        <Form style={{margin: 20, padding: 0}}onSubmit={e => this.handleLogin(e)}>
                            <FormGroup style={{fontWeight: 'bold', fontSize: 20}}>Login to PlaNUS</FormGroup>
                            <FormGroup>
                                <Label for="loginEmail">Email</Label>
                                <Input type="email" name="loginEmail" id="loginEmail" placeholder="Example@u.nus.edu" />
                            </FormGroup>
                            <FormGroup>
                                <Label for="loginPassword">Password</Label>
                                <Input type="password" name="loginPassword" id="loginPassword" placeholder="Example password" />
                            </FormGroup>
                            <Button color="primary" type="submit" style={{marginRight: 15}}>Login</Button>
                            <Button color="link" onClick={this.toggleSignUpForm}>Don't have an account? Sign up here!</Button>
                        </Form>
                    </div>
                </div>
            )
        } else {
            return <Timeline user={this.state.user} className="Timeline" />
        }
    }
}