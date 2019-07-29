import React from 'react';
import {Modal, Form, FormGroup, Button, Label, Input, TabContent, TabPane, Nav, NavItem, NavLink, Spinner} from 'reactstrap';
import Autocomplete from 'react-autocomplete';
import classnames from 'classnames';
import fb from '../../Config/config';
const modules = require('../../Data/modata.json');

//Abstracting out ideas for each component

class CustomModule extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false,
            moduleSelected: '',
            addedCustomModules: [],
            activeTab: '1'
        }
        this.toggleModal = this.toggleModal.bind(this);
        this.getModalContents = this.getModalContents.bind(this);
        this.getAddedModules = this.getAddedModules.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleCustomAdd = this.handleCustomAdd.bind(this);
        this.handleCustomRem = this.handleCustomRem.bind(this);
        this.customAddToTimeline = this.customAddToTimeline.bind(this);
        this.customRemoveFromTimeline = this.customRemoveFromTimeline.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.openNUSMod = this.openNUSMod.bind(this);
    }

    componentDidMount() {
        const userEmail = fb.auth().currentUser.email;
        this.setState(prevState => {
            return {
                ...prevState,
                isLoading: true
            }
        })
        fb.firestore().collection('users').doc(userEmail).get().then(doc => {
            if (!doc.exists) {
              console.log('Document does not exists');
            } else {
                const userPrevInfo = doc.data();
                this.setState(prevState => {
                    return {
                        ...prevState,
                        addedCustomModules: userPrevInfo.customModule === undefined ? [] : userPrevInfo.customModule,
                        isLoading: false
                    }
                })
            }
        })
    }

    toggleModal() {
        this.setState(prevState => {
            return {...prevState,
                isOpen: !prevState.isOpen
            }
        })
    }

    toggleTab(e) {
        this.setState(prevState => {
            return {
                ...prevState,
                activeTab: e
            }
        })
    }

    openNUSMod() {
        const mod = this.state.moduleSelected.split(" ")[0];
        const url = 'https://nusmods.com/modules/' + mod;
        window.open(url);
    }

    customAddToTimeline(module, year, sem) {
        const modObj = {
          module: module,
          added: [year, sem]
        }
        this.props.addToTimeline(module, year, sem);
        this.setState(prevState => {
          const newList = prevState.addedCustomModules.map(x => x);
          newList.push(modObj)
          this.props.setCustomModule(newList);
          return {
            ...prevState,
            addedCustomModules: newList
          };
        });
    }
  
    customRemoveFromTimeline(mod) {
        var temp = null;
        for (var mo of this.state.addedCustomModules) {
            if (mo.module === mod) {
                temp = mo;
                break;
            }
        }
        this.props.removeFromTimeline(temp);
        const result = [];
        for (var modObj of this.state.addedCustomModules) {
          if (modObj.module !== mod) {
            result.push(modObj);
          }
        }
        this.props.setCustomModule(result);
        this.setState(prevState => {
          return {
            ...prevState,
            addedCustomModules: result,
          };
        });
    }

    handleOnChange(e) {
        const selectedModule = e.target.value;
        this.setState(prevState => {
            return {
                ...prevState,
                moduleSelected: selectedModule
            }
        })
    }

    handleCustomAdd(e, year, sem) {
        e.preventDefault();
        const moduleCode = this.state.moduleSelected.split(" ")[0];
        if (moduleCode === null || moduleCode === undefined) {
            alert('Please select a module from the list')
        } else {
            this.customAddToTimeline(moduleCode, year, sem);
            this.setState(prevState => {
                return {
                    ...prevState,
                    isOpen: false,
                    moduleSelected: ''
                }
            });
        }
    }

    handleCustomRem(e) {
        e.preventDefault();
        const moduleToBeRemoved = e.target.moduleCode.value;
        this.customRemoveFromTimeline(moduleToBeRemoved);
        this.setState(prevState => {
            return {
                ...prevState,
                isOpen: false,
                moduleSelected: ''
            }
        })
    }

    getAddedModules() {
        var result = [];
        for (var mod of this.state.addedCustomModules) {
            const modOption = <option>{mod.module}</option>
            result.push(modOption);
        }
        return result;
    }

    getModalContents() {
        const modulesList = [];
        Object.keys(modules).forEach(k => {
            const result = k + " - " + modules[k].name;
            modulesList.push(result);
        })
        const renderHtml = (item, highlighted) => {
            return (<div
                key={item}
                style={{ backgroundColor: highlighted ? '#eee' : '#eee', maxWidth: '400px'}}
                >
                {item}
            </div>);
        }
        return (
            <div style={{textAlign: 'left', fontSize: '25px', margin: '15px', fontWeight: 'bold', border: '2px solid black', borderRadius: '3px'}}>
                {this.state.isLoading ? <div style={{display: 'grid', position: 'absolute', width: '100vw', height: '100vh', alignItems: 'center', justifyItems: 'center', background: 'rgba(0,0,0,0.5)'}}><Spinner style={{width: '100px', height: '100px'}} color="light" /></div> : null}
                <div style={{margin: '15px'}}>Add or Remove Custom Modules</div>
                <Nav tabs style={{textAlign: 'left', fontSize: '15px'}}>
                    <NavItem>
                        <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => this.toggleTab('1')}>
                            Add
                        </NavLink>                        
                    </NavItem>
                    <NavItem>
                        <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => this.toggleTab('2')}>
                            Remove
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab} style={{textAlign: 'left', fontSize: '15px', fontWeight: 'normal'}}>
                    <TabPane tabId='1'>
                    <Form style={{textAlign: 'left', margin: '10px'}}>
                        <FormGroup>
                            Add modules that are not found in the graph:
                        </FormGroup>
                        <FormGroup>
                            Enter module code:
                            <div style ={{}}>
                            <Autocomplete
                                getItemValue={i => i} 
                                items={modulesList} 
                                renderItem={renderHtml}
                                shouldItemRender={(item, value) => (item.toLowerCase().indexOf(value.toLowerCase()) === 0)} 
                                value={this.state.moduleSelected} 
                                onChange={this.handleOnChange}
                                onSelect={(val) => this.setState(pS => {return {...pS, moduleSelected: val}})}/>
                            </div>
                            <Button style={{marginTop: '5px'}} onClick={this.openNUSMod}>More info of module</Button>
                        </FormGroup>
                        <FormGroup>
                            Add to which year/sem?
                        </FormGroup>
                        <FormGroup style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr 1fr', width: '70%', gridGap: '5px'}}>
                            <Button onClick={e => this.handleCustomAdd(e, 1, 1)}>Year 1 Sem 1</Button>
                            <Button onClick={e => this.handleCustomAdd(e, 1, 2)}>Year 1 Sem 2</Button>
                            <Button onClick={e => this.handleCustomAdd(e, 2, 1)}>Year 2 Sem 1</Button>
                            <Button onClick={e => this.handleCustomAdd(e, 2, 2)}>Year 2 Sem 2</Button>
                            <Button onClick={e => this.handleCustomAdd(e, 3, 1)}>Year 3 Sem 1</Button>
                            <Button onClick={e => this.handleCustomAdd(e, 3, 2)}>Year 3 Sem 2</Button>
                            <Button onClick={e => this.handleCustomAdd(e, 4, 1)}>Year 4 Sem 1</Button>
                            <Button onClick={e => this.handleCustomAdd(e, 4, 2)}>Year 4 Sem 2</Button>
                        </FormGroup>
                    </Form>
                    </TabPane>
                    <TabPane tabId='2'>
                        <Form style={{textAlign: 'left', margin: '10px'}} onSubmit={this.handleCustomRem}>
                            <FormGroup>
                                Remove modules (Note that you can only remove modules that have been customly added by you)
                            </FormGroup>
                            <FormGroup>
                                <Label for='removeModule'>Select module code to remove:</Label>
                                <Input type='select' name='moduleCode' id='moduleCode'>
                                    {this.getAddedModules()}
                                </Input>
                            </FormGroup>
                            <Button type="submit">Remove</Button>
                        </Form>
                    </TabPane>
                </TabContent>
            </div>
        )
    }

    render() {
        return (
            [
                <NavItem style={{cursor: "pointer"}} onClick={this.toggleModal}>
                    <NavLink>Custom Module</NavLink>
                </NavItem>,
                <Modal isOpen={this.state.isOpen} toggle={this.toggleModal}>
                    {this.getModalContents()}
                </Modal>
            ]
        )
    }
}

export default CustomModule;