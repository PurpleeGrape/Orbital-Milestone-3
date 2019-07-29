import React from 'react';
import {UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import fb from '../../Config/config';
const courseInfoData = require('../../Data/courseInfoData.json');

//Abstracting out ideas for each component

class CourseInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = { 
            req: null,
            studyPlan: null
        }
    }

    componentDidMount() {
        const userEmail = fb.auth().currentUser.email;
        var db = fb.firestore();
        db.collection('users').doc(userEmail).get().then(doc => {
            const userCourse = doc.data().course;
            this.setState(prevState => {
                return {
                    req: courseInfoData[userCourse]["req"],
                    studyPlan: courseInfoData[userCourse]["studyPlan"]
                }
            })
        }).catch(err => {
            console.log('Error retrieving ' + userEmail + ' info from database');
        })
    }

    render() {
        return (
                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret>Course Info</DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={()=> {
                            window.open(this.state.req)} }>
                                Requirements
                        </DropdownItem>
                        <DropdownItem divider/>
                        <DropdownItem onClick={() => {
                            this.state.studyPlan === null ? alert('Unavailable') : window.open(this.state.studyPlan)}}>
                                Sample study plan
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
        )
    }
}

export default CourseInfo;