import React, { Component } from 'react';
import {Menu,Item, Icon, Dropdown} from 'semantic-ui-react';
import {Link, withRouter} from 'react-router-dom';

class TopMenu extends Component {
  state = { activeItem: 'my-projects' }

  render() {
    const { activeItem } = this.state
    return (
        <Menu stackable color='teal' inverted  secondary style={{borderRadius: '0px', margin: '0px', minHeight:'60px'}}>
          <Menu.Item header>
            <h3><Link to='/' style={{color:'#FFFFFF'}}>RIF-QA</Link></h3>
          </Menu.Item>          
        </Menu>
    );
  }
}

export default TopMenu;
