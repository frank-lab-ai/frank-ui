import React, { Component } from 'react';
import {Menu,Item, Icon, Dropdown, Header, Label} from 'semantic-ui-react';
import {Link, withRouter} from 'react-router-dom';

class TopMenu extends Component {
  state = { activeItem: 'my-projects' }

  render() {
    const { activeItem } = this.state
    return (
        <Menu stackable color='teal' inverted  secondary style={{borderRadius: '0px', margin: '0px', minHeight:'60px'}}>
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
