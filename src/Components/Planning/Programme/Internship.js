import React from 'react';
import {Modal, Label, DropdownItem, Input, Form, FormGroup, Button, TabContent, TabPane, Nav, NavLink, NavItem} from 'reactstrap';
import fb from '../../Config/config';
import classnames from 'classnames';

//Abstracting out ideas for each component

class Internship extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false
        }
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal() {
        this.setState(prevState => {
            return {
                isOpen: !prevState.isOpen
            }
        })
    }

    render() {
        return (
            [
                <DropdownItem onClick={() => {alert('Coming Soon!')}}>
                    Internships
                </DropdownItem>,
                <Modal isOpen={this.state.isOpen} toggle={this.toggleModal}>
                    Modal Contents!
                </Modal>
            ]
        )
    }
}

export default Internship;