import React, { Component } from 'react';
import {Menu, Header, Label} from 'semantic-ui-react';

class TopMenu extends Component {
  render() {
    return (
        <Menu stackable inverted  secondary 
                style={{borderRadius: '0px', margin: '0px', minHeight:'60px', background:'#2D3142'}}>
          <Menu.Item header>
            {/* <Link to='/' style={{color:'#FFFFFF'}}> */}
              <Header as='h1' style={{color:'#c1d2e1'}}>FRANK
                <Label size='mini' style={{background:'#252937', color:'#7B8893'}}>v.0.1.1</Label>
                <Header.Subheader  style={{color:'#9AAAB7'}}>Functional Reasoning Acquires New Knowledge</Header.Subheader>
              </Header>
            {/* </Link> */}
          </Menu.Item>          
        </Menu>
    );
  }
}

export default TopMenu;
