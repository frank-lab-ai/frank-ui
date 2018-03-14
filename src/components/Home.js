import React, { Component } from 'react';
import { Button, Menu, Label, Input, Grid, Icon, Segment, Form, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class Home extends Component {
  constructor() {
    super();
    this.state = { query: '', templates:[]  }
    this.templates = [];
  }

  handleChangeQuery(e) { 
    var queryStr = e.target.value
    this.setState({ query: queryStr})
    if(queryStr[queryStr.length-1] == ' '){    
      //generate the templates  
      fetch('http://localhost:5005/template/' + queryStr, {})
      .then(result => result.json())
      .then(response => this.updateTemplates(response))
    }
  }

  updateTemplates(t){
    this.setState({templates:t});
  }

  render() {
    var noBorderRadius = { borderRadius: '0px' }
    
    return (
      <div>
        <Segment inverted color='teal' secondary style={{ borderRadius: '0px', margin: '0px' }}>
          <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight:'auto' }}>
            <br />
            <Form>
              <Form.Input
                style={noBorderRadius} size='large'
                placeholder='Type your query...'
                action={
                  <Button onClick={() => alert("Hello")} color='orange' icon labelPosition='left' style={noBorderRadius} size='large'>
                    <Icon name='search' />Search
                            </Button>
                }
                list='templates'
                onChange={this.handleChangeQuery.bind(this)}
              />
              <datalist id='templates'>
                {this.state.templates.map((e, key) => {
                      return <option key= {key} value={e.value} />;
                })}
              </datalist>
            </Form>
            <br />
          </div>
        </Segment>

        <div style={{ marginLeft: 'auto', marginRight:'auto', paddingTop: '30px' }}>
          {/* <Header>Answers</Header> */}
          <Grid stackable columns={2}>

          </Grid>
        </div>
      </div>
    );
  }
}

export default Home;
