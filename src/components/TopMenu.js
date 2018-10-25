import React, { Component } from 'react';
import {Menu, Header, Label} from 'semantic-ui-react';

class TopMenu extends Component {
  render() {
    return (
        <Menu stackable color='teal' inverted  secondary 
                style={{borderRadius: '0px', margin: '0px', minHeight:'60px', background:'#33C3BD'}}>
          <Menu.Item header>
            {/* <Link to='/' style={{color:'#FFFFFF'}}> */}
              <Header as='h1' style={{color:'#FFFFFF'}}>FRANK
                <Label color='teal' size='mini'>v.0.0.2</Label>
                <Header.Subheader >Functional Reasoning Acquires Novel Knowledge</Header.Subheader>
              </Header>
            {/* </Link> */}
          </Menu.Item>          
        </Menu>
    );
  }
}

export default TopMenu;
