import React from 'react';
import {Modal, NavItem, NavLink, Form, CustomInput, FormGroup} from 'reactstrap';

//Abstracting out ideas for each component
//NOT IN USE AT THE MOMENT
class CourseInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false
        }
        this.toggleModal = this.toggleModal.bind(this);
        this.getModalContent = this.getModalContent.bind(this);
    }

    toggleModal() {
        this.setState(prevState => {
            return {
                isOpen: !prevState.isOpen
            }
        })
    }

    getModalContent({graphData, focusArea, internship}) {
        const focusAreaCompleted = focusArea !== null;
        const internshipCompleted = internship !== null;
        const foundationCompleted = true;
        for (var obj in graphData) {
            if (obj.added[0] === 0) {
                foundationCompleted = false;
                break;
            }
        }

        const beforeStyle = {color: 'red'};
        const afterStyle = {color: 'green'};
        return (
            <Form style={{margin: '20px', textAlign:'left'}}>
                <FormGroup style={{fontSize: '25px', fontWeight: 'bold'}}>
                University Progression:
                </FormGroup>
                <FormGroup>
                <CustomInput type="switch" id="switchForFoundation" label="Foundation" checked={foundationCompleted}/>
                </FormGroup>
                <FormGroup>
                <CustomInput type="switch" id="switchForFocusArea" label="Focus Area" checked={focusAreaCompleted}/>
                </FormGroup>
                <FormGroup>
                <CustomInput type="switch" id="switchForInternship" label="Industrial Experience/Internship" checked={internshipCompleted}/>
                </FormGroup>
                <FormGroup style={(foundationCompleted && focusAreaCompleted && internshipCompleted) ? afterStyle: beforeStyle}>
                {(foundationCompleted && focusAreaCompleted && internshipCompleted) ? "Your university degree requirements have been satisfied! :)"
                : "Some of your degree requirements have not been satisfied yet! :("}
                </FormGroup>
            </Form>
        )
    }

    render() {
        const prog = {
            graphData: this.props.graphData,
            focusArea: this.props.focusArea,
            internship: this.props.internship
        }
        return (
            [
                <NavItem style={{cursor: "pointer"}} onClick={this.toggleModal}>
                    <NavLink>CourseInfo</NavLink>
                </NavItem>,
                <Modal isOpen={this.state.isOpen} toggle={this.toggleModal}>
                    {this.getModalContent(prog)}
                </Modal>
            ]
        )
    }
}

export default CourseInfo;