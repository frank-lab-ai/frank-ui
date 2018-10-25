import React, { Component } from 'react';
import Main from './components/Main';
import TopMenu from './components/TopMenu';

class App extends Component {
  constructor(){
    super();
    this.state =  {user: {id:'0'}};
  }

  render() {
    return (
      <div>
        <TopMenu />
        <Main />
      </div>
    );
  }
}

export default App;
