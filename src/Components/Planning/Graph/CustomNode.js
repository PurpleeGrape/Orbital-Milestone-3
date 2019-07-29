import React from 'react';
import { Tooltip } from 'reactstrap';
import yellowHex from '../../../Images/nYellow.png';
import redHex from '../../../Images/nRed.png';
import aquamarineHex from '../../../Images/nAquamarine.png';
import blackHex from '../../../Images/nGreyBlack1.png';

class CustomNode extends React.Component {
    constructor(props) {
      super();
      this.state = { tooltipOpen: false, result: null }
      this.getTooltipContent = this.getTooltipContent.bind(this);
      this.toggle = this.toggle.bind(this);
    }

    getTooltipContent(info) {
      if (this.state.result === null) {
        const listItems = info.require.map(x => {
          const subItems = x.name.map(y => {
            return <li>{y}</li>;
          })
          return <ul>Any one of: {subItems}</ul>;
        })
        const result = (<div class='tooltip-content'>
          <div style={{fontSize: 15, textAlign:'left', marginBottom: '5px'}}>{info.name}</div>
          <ul style={{fontSize: 13}}>
            This module requires:
            {listItems}
          </ul>
        </div>)
        this.setState(prevState => {
          return {
            ...prevState,
            result: result
          }
        })
        return result;
    } else {
      return this.state.result;
    }
  }

  toggle() {
    this.setState(prevState => {
      return {
        ...prevState,
        tooltipOpen: !prevState.tooltipOpen
      }
    })
  }

  render() {
    var unlocked = true;
    const lockedIcon = blackHex;
    const defaultIcon = yellowHex;
    const addedIcon = redHex;
    const exemptedIcon = aquamarineHex;
    var info = this.props.info
    for (var i = 0; i < info.require.length; i = i + 1) {
      if (info.require[i].unlocked === false) {
        unlocked = false;
        break;
      }
    }
    const textColor = (info.added[0] === -1) ? 'black' : unlocked ? 'black' : 'white';
    return (
        <div class="NodeBox">
          <div>
            <div class={unlocked ? "textBox" : "textBoxLocked"} id={info.id}>
              <div class="textContent" style={{color: textColor}}>{info.id}</div>
            </div>
              <Tooltip style={{border: '1px solid white'}} placement="top" isOpen={this.state.tooltipOpen} target={info.id} toggle={this.toggle}>
                {this.getTooltipContent(info)}
              </Tooltip>
            <div>
              {
              <img class={info.added[0] === -1 ? "Image-after" : (unlocked ? (info.added[0] > 0 ? "Image-after" : "Image-before") : "Image-locked")} src={info.added[0] === -1 ? exemptedIcon : (unlocked ? (info.added[0] > 0 ? addedIcon : defaultIcon) : lockedIcon)} alt="new"/>
              //<img class={unlocked ? (info.added[0] > 0 ? "Image-after" : "Image-before") : "Image-locked"} src={(unlocked ? (info.added[0] > 0 ? addedIcon : defaultIcon) : lockedIcon)} alt="new"/>
              }
              </div>
          </div>
        </div>
    )
  }
}

export default CustomNode;