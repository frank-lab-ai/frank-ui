import React, { Component } from 'react';
import {Menu, Header, Label} from 'semantic-ui-react';

class TopMenu extends Component {
  render() {
    return (
        <Menu stackable color='teal' inverted  secondary 
                style={{borderRadius: '0px', margin: '0px', minHeight:'60px', background:'#33C3BD'}}>
          <Menu.Item header>
            {/* <Link to='/' style={{color:'#FFFFFF'}}> */}
              <Header as='h2'>FRANK
                <Label color='red' size='mini'>alpha 0.0.1</Label>
                <Header.Subheader>Functional Reasoning for Acquiring Novel Knowledge</Header.Subheader>
              </Header>
            {/* </Link> */}
          </Menu.Item>          
        </Menu>
    );
  }
}

export default TopMenu;
