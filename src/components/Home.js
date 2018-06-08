import React, { Component } from 'react';
import { Button, Grid, Icon, Segment, Form, Accordion, List, Header, Statistic, Loader, Dimmer, Label, Tab } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import InferenceGraph from './InferenceGraph';
import '../home.css'


class Home extends Component {
  constructor() {
    super();
    this.state = { query: '', templates:[], activeIndex: 10, alist:{}, alist_string:'', answer:{}, loading: false, answer_returned: false}
    this.templates = [];
    this.queryEx = [
      "What will be the population of Ghana in 2005",
      "What is the capital of Germany?",
      "What is the GDP of the country with the largest female unemployment in Africa?"                  
    ]
  }  

  handleAccordionClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  handleChangeQuery(e) { 
    var queryStr = e.target.value
    this.setState({ query: queryStr})
    if(queryStr[queryStr.length-1] === ' ' || queryStr[queryStr.length-1] === '?'){    
      //generate the templates  
      fetch('http://localhost:5005/template/' + queryStr, {})
      .then(result => result.json())
      .then(response => this.updateAlistAndTemplates(response))
    }
  }

  handleRIFQuery(){
    this.setState({loading: true, answer_returned: false})
    const { alist } = this.state
    console.log(JSON.stringify(alist))
    fetch('http://localhost:9876/query',{
      method: 'POST',
      body: JSON.stringify(alist)
    })
    .then(result => result.json())
    .then(response => this.displayAnswer(response))
  }

  handleExItemClick = (e, listItemProps)=>{
    const {children} = listItemProps
    // console.log(children)
    this.setState({query:children})
  }

  updateAlistAndTemplates(data){
    // console.log(data)
    this.setState({});
    this.setState({templates:data['templates'], alist: data['alist'], alist_string: data['alist_string']})
  }

  displayAnswer(data){    
    // console.log(data)
    this.setState({answer: data, answer_returned: true, loading: false})
  }

  render() {
    var whiteBgStyle = { borderRadius: '0px', background: 'white', padding:'5px'}
    const { activeIndex } = this.state
    
    const exlistItems = this.queryEx.map((ex, index)=>
    <List.Item as='a' key={index} onClick={this.handleExItemClick}>{ex}</List.Item>
    )
    
    return (
      <div>
        <Segment inverted color='teal' secondary style={{ borderRadius: '0px', margin: '0px' }}>
          <div style={{ maxWidth: '800px' }}>
            <br />
            <Form>
              <Form.Input className='no_input_focus'
                value={this.state.query}
                style={whiteBgStyle} size='large' transparent
                placeholder='Type your query...'
                action={
                  <Button onClick={this.handleRIFQuery.bind(this)} color='orange' icon labelPosition='left'
                    style={{borderRadius: '0px', marginLeft:'8px'}} size='large'>
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
              {/* alist */}
              { this.state.alist_string !== '' &&
                <Segment style={{borderRadius:'0px', paddingLeft: '20px', background:'#6FD5D0', border:'none', color:'white'}}>
                  {/* <Label color='grey 'attached='top left'>Query Alist</Label> */}
                    {this.state.alist_string}
                </Segment>
              }
              {/* query examples */}
              <Accordion>
                <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleAccordionClick}>
                  <Icon name='dropdown' />
                  See examples of queries
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 1}>
                  <Segment style={{borderRadius:'0px', paddingLeft: '20px', background:'#6FD5D0', border:'none'}}>
                    <List link >
                      {exlistItems}
                    </List>
                  </Segment>
                </Accordion.Content>
              </Accordion>
            </Form>
            <br />
          </div>
        </Segment>
        
        
          <Segment basic style={{ marginLeft: '0px', paddingTop: '0px', marginRight: '15px' }}>
            <Dimmer active={this.state.loading === true} inverted>
              <Loader active={this.state.loading === true} inverted inline='centered' content='searching/calculating answer'/>
            </Dimmer>

            <Header>Answer</Header>
            <Segment style={{borderRadius:'0px', paddingLeft: '20px',
              background:'#fff',border:'none', color:'black', maxWidth:'800px'}}>
              <Statistic horizontal>
                <Statistic.Value>{this.state.answer.answer}</Statistic.Value>
                <Statistic.Label> +/-{this.state.answer.error_bar}</Statistic.Label>
              </Statistic>
              <br/>
              <Label as='a' small color='orange'>
                <Icon name='globe' />Sources
                <Label.Detail>{this.state.answer.sources}</Label.Detail>
              </Label>
            
              <Label as='a' small color='grey'>
                <Icon name='hourglass end' /> Elapsed Time
                <Label.Detail>{this.state.answer.elapsed_time}</Label.Detail>
              </Label>

            </Segment>
            <Segment style={{borderRadius:'0px', paddingLeft: '20px', 
              background:'#fff',border:'none', color:'black', maxWidth:'800px'}}>
              <Header as='h4'>Answer Alist</Header>
              {JSON.stringify(this.state.answer.alist)}
            </Segment>



            <Tab  menu={{ secondary: true, pointing: true }} panes={
              [
                { menuItem: 'Trace', render: () =>
                    <Tab.Pane basic attached={false}>
                    <Segment basic style={{borderRadius:'0px', background:'transparent',border:'none'}}>
                      <List divided relaxed>
                        {this.state.answer_returned ? 
                        this.state.answer.trace.map((item, index)=>{ return <List.Item>{item}</List.Item>})
                        : ""}
                      </List>
                    </Segment>
                  </Tab.Pane>
                },
                { menuItem: 'Inference Tree', render: () => 
                  <Tab.Pane basic attached={false}>
                    <InferenceGraph />
                  </Tab.Pane>
                }
              ]
            } />
            
          </Segment>
      
        {/* <div style={{ marginLeft: '15px', paddingTop: '30px' }}>
        <Loader active inline='centered' />
        </div> */}
      </div>
    );
  }
}

export default Home;
