import React, { Component } from 'react';
import { Button, Icon, Segment, Form, Modal, List, Header, Statistic, Label, Tab, Image, Popup } from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import InferenceGraph from './InferenceGraph';
import '../home.css'
import { isNullOrUndefined } from 'util';



class Home extends Component {
  constructor() {
    super();
    this.state = { query: '', templates:[], activeIndex: 10, alist:{}, alist_string:'', 
      answer:{}, loading: false, final_answer_returned: false, partial_answer_returned:false, errorMessage:'', examplesOpen:false, sessionId:'', 
      currentCount: 0, intervalId: null, timedOut: false, maxCheckAttempts: 100}
    this.templates = [];
    this.queryEx = [
      "What was the gdp of Ghana in 1998?",
      "What will be the population of Ghana in 2026?",
      "What is the capital of the United Kingdom?",
      "What was the population in 2005 of the country in Africa with the highest gdp in 2010?",
      "country with the largest population in 1998",
      "country in Europe with the lowest population in 2010"                  
    ]
    this.server_host = "34.242.204.151"; //;"remote"
    //this.server_host = "localhost"; //;"localhost"
    this.webui_api_endpoint = "http://" + this.server_host + ":5005";
    this.frank_server_endpoint = "http://" + this.server_host + ":9876/query";
    this.timer = this.timer.bind(this);
  }  

  handleAccordionClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex, isError:false, errorMessage:"" })
  }

  handleChangeQuery(e) { 
    this.setState({errorMessage:""})
    var queryStr = e.target.value
    this.setState({ query: queryStr, isError:false})
    if(queryStr.trim().length === 0)
      this.setState({ alist: {}, alist_string:""})
    this.getQueryAlist(queryStr)
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
    this.setState({query:children, activeIndex:10, examplesOpen:false}) //change active index to close accordion
    this.getQueryAlist(children)
  }

  getQueryAlist(queryStr){
    if(queryStr.trim().length === 0) return;
    //var queryStr = this.state.query
    //if(queryStr[queryStr.length-1] === ' ' || queryStr[queryStr.length-1] === '?'){    
      // console.log("generating")
      //generate the templates  
      fetch(this.webui_api_endpoint + '/template/' + queryStr, {})
      .then(result => result.json())
      .then(response => this.updateAlistAndTemplates(response))
      .catch(err=>this.setState({currentCount: 0, isError:true, errorMessage: "Sorry. FRANK's reasoner is currently offline.", loading: false}))
    //}
  }
  

  handleRIFQuery(){
    if(this.state.query.trim().length === 0) return;
    if(!Object.keys(this.state.alist).length){
      this.setState({isError:true, errorMessage:"FRANK was unable to parse your questions. Can you rephrase?"})
      return;
    }
    const sessionId = this.generateQuickGuid()
    this.setState({loading: true, final_answer_returned: false, partial_answer_returned:false, answer:{}, sessionId, currentCount:this.state.maxCheckAttempts, timedOut:false, isError:false}, ()=>{
      const { alist } = this.state
      fetch(this.frank_server_endpoint,{
        method: 'POST',
        body: JSON.stringify({alist:alist,  sessionId: sessionId})
      })
      .then(response => response.json())
      .then(result => this.displayAnswer(result))
      .catch(err=>this.setState({currentCount: 0, isError:true, errorMessage: "Sorry. FRANK's reasoner is currently offline.", loading: false}))

      //check for answer at timer intervals
      var intervalId = setInterval(this.timer, 3000);
      this.setState({intervalId: intervalId});
    })

  }

  checkForAnswer(){
    fetch(this.webui_api_endpoint + '/answer/' + this.state.sessionId, {})
    .then(result => result.json())
    .then(response => {
      this.displayProgressTrace(response)
    })   
  }

  timer=()=>{
    var newCount = this.state.currentCount - 1;
    if(newCount >= 0) { 
        this.checkForAnswer()
        this.setState({ currentCount: newCount });
    } else {
        clearInterval(this.state.intervalId);
        this.setState({timedOut:true, loading:false})
    }
 }

  generateQuickGuid() {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
  

  updateAlistAndTemplates(data){
    // console.log(data)
    this.setState({template:data['template'], alist: data['alist'], alist_string: data['alist_string'], question: data['question'], isError: false})
  }

  displayAnswer(data){ 
    clearInterval(this.state.intervalId);  // stop timer for checks
    this.setState({answer: data, final_answer_returned: true, loading: false, isError:false})
  }

  displayProgressTrace(data){
    var answer = this.state.answer;
    answer = data.partial_answer;
    answer.trace = data.trace;
    answer.graph_nodes = data.graph_nodes
    answer.graph_edges = data.graph_edges
    this.setState({
        answer: answer, 
        partial_answer_returned: !isNullOrUndefined(data.partial_answer) && !isNullOrUndefined(data.partial_answer.alist)})
  }

  render() {
    var whiteBgStyle = { borderRadius: '0px', background: 'white', padding:'5px', marginBottom:0}
    var alistBgStyle = { borderRadius:'0px', padding:'5px', background:'#E7E9EC',
                          border:'none', color:'#fff', fontFamily:'Ubuntu Mono'}
    const { activeIndex } = this.state
  
    
    return (
      <div>
        <Segment inverted secondary style={{ borderRadius: '0px', margin: '0px', background:'#2D3142'}}>
          <div style={{ maxWidth: '1000px', marginLeft:'auto', marginRight:'auto' }}>
            <br />
            <Label as='a' content='Try these examples' icon='info'
              onClick={()=>this.setState({examplesOpen:true})} style={{marginBottom:5, float:'right', 
              background:'#252937', color:'#7B8893'}}/>
              <div style={{clear:'both'}} />
            <Form style={{marginBottom:0}}>              
              <Form.Input className='no_input_focus'
                value={this.state.query}
                style={whiteBgStyle} size='large' transparent
                placeholder='Type your question...'
                action={
                 
                      <Button onClick={this.handleRIFQuery.bind(this)} color='orange' icon
                        style={{borderRadius: '0px', marginLeft:'8px'}} size='large'>
                        <Icon name='search' />
                      </Button>
                }
                list='templates'
                onChange={this.handleChangeQuery.bind(this)}
              /> 
              { this.state.query.trim() !== "" &&
              <div>
                <div style={{background:'#404353', padding:10, paddingTop:20, marginTop:'-14px'}}>
                  <p style={{fontSize:13, fontWeight:'700', color:'#A9BAC9'}}>
                    Generated Alist 
                    <Popup inverted trigger={
                      <Icon size='large' color='orange' name='question circle' style={{marginTop:'-5px', marginLeft:'5px'}}/>
                    } 
                      content='An alist is a set of attribute-value pairs. It is the internal formal representation of questions and data in FRANK.' />:
                  </p>
                  <p style={{fontSize:13, fontWeight:'400', color:'#A9BAC9'}}>{this.state.alist_string}</p>
                  <ReactJson src={this.state.alist} theme='monokai' 
                    displayDataTypes={false} displayObjectSize={false} name={false}
                    style={{padding:10, background:'#404353', fontSize:11}} />
                </div>
              </div>
              }
            </Form>
            <br />
          </div>
        </Segment>

        <Modal
            header='Examples of questions'
            centered={false}
            content={
              <div style={{borderRadius:'0px', padding: '20px', border:'none'}}>
                <List link >
                  {this.queryEx.map((ex, index)=>
                    <List.Item as='a' key={index} onClick={this.handleExItemClick}
                      style={{color:'black', fontSize:15, margin:5}}>{ex}</List.Item>
                    )
                  }
                </List>
              </div>
            }
            open={this.state.examplesOpen}
            onClose={()=>this.setState({examplesOpen:false})}
            closeOnDimmerClick={true}
            closeOnEscape={true}
            actions={[{ key: 'close', content: 'Close',}]}
          />
        
        
        <Segment basic style={{ marginLeft: '0px', paddingTop: '0px', marginRight: '0px',marginTop: '35px' }}>
          {/* <Dimmer active={this.state.loading === true} inverted> */}
            {/* <Loader active={this.state.loading === true} inverted inline='centered' content='searching/calculating answer'/> */}
            {/* <Image src='loading.svg' centered/>
          </Dimmer> */}

          {/* <Header>Answer</Header> */}
          {this.state.loading && !this.state.final_answer_returned && !this.state.partial_answer_returned && 
            <Image src='loading.svg' centered size='tiny'/>
          }
          {this.state.isError &&
            <Segment style={{borderRadius:'0px', padding: '20px', 
              background:'#fff',border:'none', color:'black', maxWidth:'1000px', marginLeft:'auto', marginRight:'auto'}}>
              <span style={{fontSize:13}}> <Icon name='exclamation triangle' color='yellow' size='large' /> {this.state.errorMessage} </span>
            </Segment>
          }
          {(this.state.final_answer_returned || this.state.partial_answer_returned) &&
            <Segment style={{borderRadius:'0px', paddingLeft: '20px',
              background:'#fff',border:'none', color:'black', maxWidth:'1000px', marginLeft:'auto', marginRight:'auto' }}>
              {this.state.loading && 
                <Image src='loading.svg' centered size='tiny'/>
              }
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
          
          {(this.state.final_answer_returned || this.state.partial_answer_returned) &&
            <Segment style={{borderRadius:'0px', paddingLeft: '20px', 
              background:'#fff',border:'none', color:'black', maxWidth:'1000px', fontFamily:'Ubuntu Mono', marginLeft:'auto', marginRight:'auto'}}>
              <Header as='h4'>Answer Alist</Header>
              {JSON.stringify(this.state.answer.alist)}
            </Segment>
          }

          {this.state.final_answer_returned===false && this.state.timedOut && !this.state.isError &&
            <Segment style={{borderRadius:'0px', paddingLeft: '20px',
              background:'#fff',border:'none', color:'black', maxWidth:'1000px', marginLeft:'auto', marginRight:'auto' }}>
              <div style={{padding:10}}>
                <Header as='h2'>Timed Out</Header>
                <span style={{fontSize:15}}>I give up! I could not find you an answer within reasonable time.</span>
              </div>

              </Segment>
            }


          {isNullOrUndefined(this.state.answer.trace) ===false &&
          <Tab menu={{ secondary: true, pointing: true }} panes={
            [
              { menuItem: 'Trace', render: () =>
                  <Tab.Pane basic attached={false}>
                  <Segment basic style={{borderRadius:'0px', background:'transparent',border:'none', fontFamily:'Ubuntu Mono'}}>
                    <List divided relaxed size='tiny'>
                      {isNullOrUndefined(this.state.answer.trace) ===false ? 
                      this.state.answer.trace.map((item, index)=>{ return <List.Item key={index} >{item}</List.Item>})
                      : ""}
                    </List>
                  </Segment>
                </Tab.Pane>
              },
              { menuItem: 'Inference Tree', render: () => 
                {(this.state.final_answer_returned || this.state.partial_answer_returned) &&
                  isNullOrUndefined(this.state.answer.graph_nodes) ===false && 
                  isNullOrUndefined(this.state.answer.graph_edges) ===false &&
                  this.state.answer.graph_nodes.length > 0 && 
                  <Tab.Pane basic attached={false}>
                    <InferenceGraph nodes={this.state.answer.graph_nodes} edges={this.state.answer.graph_edges} />
                  </Tab.Pane>
                }
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
