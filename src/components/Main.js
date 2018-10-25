import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './Home';

class Main extends Component {
  constructor() {
    super();
    this.state = { user: {} };
  }

  render() {
    return (
      <Switch>
        <Route exact path='/' component={Home} />
      </Switch>

    );
  }
}

export default Main;
