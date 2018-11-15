import React, { Component } from 'react';
import { Button, Icon, Segment, Form, Accordion, List, Header, Statistic, Label, Tab, Image } from 'semantic-ui-react';
import InferenceGraph from './InferenceGraph';
import '../home.css'


class Home extends Component {
  constructor() {
    super();
    this.state = { query: '', templates:[], activeIndex: 10, alist:{}, alist_string:'', 
      answer:{}, loading: false, answer_returned: false}
    this.templates = [];
    this.queryEx = [
      "What was the gdp of Ghana in 1998?",
      "What will be the population of Ghana in 2026?",
      "What is the capital of the United Kingdom?",
      "What is the GDP of the country in Africa with the largest unemployment in 2010?",
      "country in Europe with the lowest population in 2010"                  
    ]
    this.server_host = "34.242.204.151"; //;"localhost"
    this.webui_api_endpoint = "http://" + this.server_host + ":5005";
    this.frank_server_endpoint = "http://" + this.server_host + ":9876/query";
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
    //this.getQueryAlist()
  }

  handleAlistChange(e) { 
    var alist_json = {}
    try{
      alist_json=JSON.parse(e.target.value)
        
    }
    catch(e){
      console.log("Invalid json format")
    }
    this.setState({alist_string: e.target.value, alist: alist_json })  
    
  }


  handleExItemClick = (e, listItemProps)=>{
    const {children} = listItemProps
    // console.log(children)
    this.setState({query:children, activeIndex:10}) //change active index to close accordion
    this.getQueryAlist()
  }

  getQueryAlist(){
    var queryStr = this.state.query
    //if(queryStr[queryStr.length-1] === ' ' || queryStr[queryStr.length-1] === '?'){    
      console.log("generating")
      //generate the templates  
      fetch(this.webui_api_endpoint + '/template/' + queryStr, {})
      .then(result => result.json())
      .then(response => this.updateAlistAndTemplates(response))
    //}
  }

  handleRIFQuery(){
    this.setState({loading: true, answer_returned: false})
    const { alist } = this.state
    console.log(JSON.stringify(alist))
    fetch(this.frank_server_endpoint,{
      method: 'POST',
      body: JSON.stringify(alist)
    })
    .then(result => result.json())
    .then(response => this.displayAnswer(response))
  }

  

  updateAlistAndTemplates(data){
    // console.log(data)
    this.setState({template:data['template'], alist: data['alist'], alist_string: data['alist_string'], question: data['question']})
  }

  displayAnswer(data){    
    // console.log(data)
    this.setState({answer: data, answer_returned: true, loading: false})
  }

  render() {
    var whiteBgStyle = { borderRadius: '0px', background: 'white', padding:'5px'}
    var alistBgStyle = { borderRadius:'0px', padding:'5px', background:'#E7E9EC',
                          border:'none', color:'#fff', fontFamily:'Ubuntu Mono'}
    const { activeIndex } = this.state
    
    const exlistItems = this.queryEx.map((ex, index)=>
    <List.Item as='a' key={index} onClick={this.handleExItemClick}>{ex}</List.Item>
    )
    
    return (
      <div>
        <Segment inverted color='teal' secondary style={{ borderRadius: '0px', margin: '0px' }}>
          <div style={{ maxWidth: '1000px', marginLeft:'auto', marginRight:'auto' }}>
            <br />
            <Form>
              <Form.Input className='no_input_focus'
                value={this.state.query}
                style={whiteBgStyle} size='large' transparent
                placeholder='Type your query...'
                action={
                  <Button onClick={this.getQueryAlist.bind(this)} color='orange' icon
                    style={{borderRadius: '0px', marginLeft:'8px'}} size='large'>
                    <Icon name='exchange' />
                  </Button>
                }
                list='templates'
                onChange={this.handleChangeQuery.bind(this)}
              />

              <Form.Input className='alist_input'
                value={this.state.alist_string}
                size='large' transparent
                placeholder='translated alist ...'
                action={
                  <Button onClick={this.handleRIFQuery.bind(this)} color='orange' icon
                    style={{borderRadius: '0px', marginLeft:'8px'}} size='large'>
                    <Icon name='search' />
                  </Button>
                }
                onChange={this.handleAlistChange.bind(this)}
              />

              {/* <datalist id='templates'>
                {this.state.templates.map((e, key) => {
                      return <option key= {key} value={e.value} />;
                })}
              </datalist> */}
              {/* alist */}
              {/* { this.state.alist_string !== '' &&
                <Segment style={{borderRadius:'0px', paddingLeft: '20px', background:'#000000',
                 border:'none', color:'#fff', fontFamily:'Ubuntu Mono', opacity:'0.5'}}>
                  
                    {this.state.alist_string}
                </Segment>
              } */}
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
        
        
        <Segment basic style={{ marginLeft: '0px', paddingTop: '0px', marginRight: '15px',marginTop: '35px' }}>
          {/* <Dimmer active={this.state.loading === true} inverted> */}
            {/* <Loader active={this.state.loading === true} inverted inline='centered' content='searching/calculating answer'/> */}
            {/* <Image src='loading.svg' centered/>
          </Dimmer> */}

          {/* <Header>Answer</Header> */}
          {this.state.loading && 
            <Image src='loading.svg' centered/>
          }
          {this.state.answer_returned &&
            <Segment style={{borderRadius:'0px', paddingLeft: '20px',
              background:'#fff',border:'none', color:'black', maxWidth:'1000px', marginLeft:'auto', marginRight:'auto' }}>
              <div>
                <Statistic style={{float:'left', marginRight: '30px'}}>
                  <Statistic.Value >{this.state.answer.answer}</Statistic.Value>
                </Statistic>
                
                {parseFloat(this.state.answer.error_bar) > 0 &&
                  <Statistic style={{float:'left', marginLeft: '10px', marginTop:'10px'}}>
                    <Statistic.Label > &plusmn; {this.state.answer.error_bar}</Statistic.Label>
                  </Statistic>
                }
              </div>
              <div style={{clear: 'both'}} />
              {/* <Statistic horizontal>
                
               
              </Statistic> */}
              <br/>
              <Label as='a' small='true' color='orange' style={{marginTop: '2px'}}>
                <Icon name='globe' />Sources
                <Label.Detail>{this.state.answer.sources}</Label.Detail>
              </Label>
            
              <Label as='a' small='true' color='grey' style={{marginTop: '2px'}}>
                <Icon name='hourglass end' /> Elapsed Time
                <Label.Detail>{this.state.answer.elapsed_time}</Label.Detail>
              </Label>

            </Segment>
          }
          
          {this.state.answer_returned &&
            <Segment style={{borderRadius:'0px', paddingLeft: '20px', 
              background:'#fff',border:'none', color:'black', maxWidth:'1000px', fontFamily:'Ubuntu Mono', marginLeft:'auto', marginRight:'auto'}}>
              <Header as='h4'>Answer Alist</Header>
              {JSON.stringify(this.state.answer.alist)}
            </Segment>
          }


          {this.state.answer_returned &&
          <Tab menu={{ secondary: true, pointing: true }} panes={
            [
              { menuItem: 'Trace', render: () =>
                  <Tab.Pane basic attached={false}>
                  <Segment basic style={{borderRadius:'0px', background:'transparent',border:'none', fontFamily:'Ubuntu Mono'}}>
                    <List divided relaxed size='tiny'>
                      {this.state.answer_returned ? 
                      this.state.answer.trace.map((item, index)=>{ return <List.Item key={index} >{item}</List.Item>})
                      : ""}
                    </List>
                  </Segment>
                </Tab.Pane>
              },
              { menuItem: 'Inference Tree', render: () => 
                <Tab.Pane basic attached={false}>
                  <InferenceGraph nodes={this.state.answer.graph_nodes} edges={this.state.answer.graph_edges} />
                </Tab.Pane>
              }
            ]
          } />
        }
        </Segment>
      </div>
    );
  }
}

export default Home;
