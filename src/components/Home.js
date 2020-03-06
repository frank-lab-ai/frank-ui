import React, { Component } from 'react';
import { Button, Icon, Segment, Form, Modal, List, Header, Statistic, Label, Tab, Image, Popup, Grid, Menu, Sidebar, Checkbox } from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import InferenceGraph from './InferenceGraph';
import CytoscapeGraph from './CytoscapeGraph';
import FrankChart from './FrankChart';
import NumericInput from 'react-numeric-input';
import '../home.css'
import { isNullOrUndefined } from 'util';
import { saveAs } from 'file-saver';
import AceEditor from "react-ace";
import BlanketInput from './BlanketInput';

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";


const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}


class Home extends Component {
  constructor() {
    super();
    this.state = {
      query: '', templates: [], activeIndex: 10, alist: {}, alist_string: '',
      answer: {}, loading: false, final_answer_returned: false, intermediate_answer_returned: false, errorMessage: '', examplesOpen: false, sessionId: '',
      currentCount: 0, intervalId: null, timedOut: false,
      maxCheckAttempts: 600, // 600 attempts with 3 seconds intervals = 30 hour before UI timeout. 
      answerCheckInterval: 3000, //3 seconds
      questionAnswered: '', alist_node: {}, loadingSelectedAlist: false,
      ancestorBlanketLength: 1, descendantBlanketLength:1, explanation:{what:'', how:'', why:'', sources:''}, traceOpen:false,
      plotData:{}, questionView:true, inferenceGraphView:false, sidebarVisible: false, cy: null,
      nlView: true, editorAlist:'{"h":"value"}', autorefresh_graph:true,
      // plotData: {
      //   "p": "population",
      //   "fp": "{\"function\" :[-5.2617682627407867E8,294139.066666669], \"data\":[[2017.0, 6.7118648E7],[2016.0, 6.6706879333333336E7],[2015.0, 6.6486984E7],[2014.0, 6.6316092E7],[2013.0, 6.5969263E7],[2012.0, 6.56546795E7],[2011.0, 6.53431815E7],[2010.0, 6.50253245E7],[2009.0, 6.47049825E7]]}",
      //   "h": "regress", "o": "?y0", "v": "?y0", "t": "2026", "id": "102", "s": "France",
      //   "xp": " The predicted population value using a regression function based on values from past years is 6.97489227925927E7."
      // },      
    }

    this.templates = [];
    this.queryEx = [
      "What was the gdp of Ghana in 1998?",
      "What will be the population of France in 2026?",
      "What is the capital of the United Kingdom?",
      "What was the population in 2005 of the country in Europe with the highest gdp in 2010?",
      "country with the largest population in 1998",
      "country in Europe with the lowest population in 2010"
    ]
    this.server_host = "34.242.204.151"; //;"remote"
    // this.server_host = "localhost"; //;"localhost"
    this.frank_api_endpoint = "http://" + this.server_host + ":9876";
    this.timer = this.timer.bind(this);
  }

  handleAccordionClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex, isError: false, errorMessage: "" })
  }

  handleChangeQuery(e) {
    this.setState({ errorMessage: "" })
    var queryStr = e.target.value
    this.setState({ query: queryStr, isError: false })
    if (queryStr.trim().length === 0)
      this.setState({ alist: {}, alist_string: "" })
    this.getQueryAlist(queryStr)
  }

  handleAlistChange(e) {
    var alist_json = {}
    try {
      alist_json = JSON.parse(e.target.value)
    }
    catch (e) {
      console.log("Invalid json format")
    }
    this.setState({ alist_string: e.target.value, alist: alist_json })
  }


  handleExItemClick = (e, listItemProps) => {
    const { children } = listItemProps
    // console.log(children)
    this.setState({ query: children, activeIndex: 10, examplesOpen: false }) //change active index to close accordion
    this.getQueryAlist(children)
  }

  getQueryAlist(queryStr) {
    if (queryStr.trim().length === 0) return;
    //var queryStr = this.state.query
    //if(queryStr[queryStr.length-1] === ' ' || queryStr[queryStr.length-1] === '?'){    
    // console.log("generating")
    //generate the templates  
    fetch(this.frank_api_endpoint + '/template/' + queryStr, {})
      .then(result => result.json())
      .then(response => this.updateAlistAndTemplates(response))
      .catch(err => this.setState({ currentCount: 0, isError: true, errorMessage: "Sorry. The FRANK reasoner is currently offline.", loading: false }))
    //}
  }




  handleRIFQuery(isAlistEditor) {
    if (isAlistEditor){
      this.setState({query: this.state.editorAlist})
    }
    if (this.state.query.trim().length === 0) return;
    if (!Object.keys(this.state.alist).length) {
      this.setState({ isError: true, errorMessage: "FRANK was unable to parse your questions. Can you rephrase?" })
      return;
    }
    const sessionId = this.generateQuickGuid()
    this.setState({
      loading: true, final_answer_returned: false, partial_answer_returned: false, answer: {}, sessionId,
      currentCount: this.state.maxCheckAttempts, timedOut: false, isError: false, 
      questionAnswered: isAlistEditor? this.state.editorAlist : this.state.query, 
      alist_node: {},
      loadingSelectedAlist: false
    }, () => {
      const { alist } = this.state
      fetch(this.frank_api_endpoint + "/query", {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ alist: alist, sessionId: sessionId })
      })
        .then(response => response.json())
        .then(result => this.displayAnswer(result))
        .catch(err => this.setState({ currentCount: 0, isError: true, errorMessage: "Sorry. FRANK's reasoner is currently offline.", loading: false }))

      //check for answer at timer intervals
      var intervalId = setInterval(this.timer, this.state.answerCheckInterval);
      this.setState({ intervalId: intervalId });
    })

  }

  checkForAnswer() {
    fetch(this.frank_api_endpoint + '/answer/' + this.state.sessionId, {})
      .then(result => result.json())
      .then(response => {
        this.displayProgressTrace(response)
      })
  }

  timer = () => {
    var newCount = this.state.currentCount - 1;
    if (this.state.final_answer_returned === false && newCount >= 0) {
      this.checkForAnswer()
      this.setState({ currentCount: newCount });
    } else {
      clearInterval(this.state.intervalId);
      this.setState({ timedOut: true, loading: false, currentCount: 0 })
    }
  }

  generateQuickGuid() {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }


  updateAlistAndTemplates(data) {
    // console.log(data)
    this.setState({ template: data['template'], alist: data['alist'], alist_string: data['alist_string'], 
      question: data['question'], editorAlist: JSON.stringify(data['alist'], null, 2), isError: false })
  }

  displayAnswer(data) {
    if (data.answer !== undefined) {
      clearInterval(this.state.intervalId);  // stop timer for checks
      var today = new Date();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      this.setState({ answer: data, final_answer_returned: true, loading: false, isError: false, answer_data_last_changed:time })
    }
  }

  displayProgressTrace(data) {
    var answer = this.state.answer;
    answer = data.partial_answer;
    answer.trace = data.trace;
    answer.graph_nodes = data.graph_nodes
    answer.graph_edges = data.graph_edges
    var isFinal = data.answer !== undefined && data.answer.length > 0
    if (isFinal)
      clearInterval(this.state.intervalId)
    var isError = this.state.isError
    if (isFinal || !isNullOrUndefined(data.partial_answer))
      isError = false;
    
    var answer_last_changed = this.state.answer_data_last_changed
    if (this.state.autorefresh_graph === true){
      answer_last_changed = new Date().getTime();
    }

    this.setState({
      answer: answer,
      final_answer_returned: isFinal,
      loading: !isFinal,
      isError: false,
      partial_answer_returned: !isNullOrUndefined(data.partial_answer) && !isNullOrUndefined(data.partial_answer.alist),
      answer_data_last_changed:answer_last_changed
    })
  }

  handleNodeClick(nodeId) {
    this.setState({ loadingSelectedAlist: true })
    fetch(`${this.frank_api_endpoint}/alist/${this.state.sessionId}/${nodeId}/blanketlengths/${this.state.ancestorBlanketLength}/${this.state.descendantBlanketLength}`, {})
      .then(result => result.json())
      .then(response => {
        this.setState({ alist_node: response.alist, explanation: response.explanation, loadingSelectedAlist: false, sidebarVisible:true })
      })
  }

  handleUpdateCyObj(cyObj){
    this.setState({cy: cyObj})
  }

  handleAnscestorBlanketLengthChange(value){
    this.setState({ancestorBlanketLength: value}, ()=>{
      if (this.state.alist_node !== undefined && Object.keys(this.state.alist_node).length > 0){
        this.handleNodeClick(this.state.alist_node.id)
      }
    })
  }

  handleDescendantBlanketLengthChange(value){
    this.setState({descendantBlanketLength: value}, ()=>{
      if (this.state.alist_node !== undefined && Object.keys(this.state.alist_node).length > 0){
        this.handleNodeClick(this.state.alist_node.id)
      }
    })
  }

  handleDownloadInferenceGraph(){
    var cy = this.state.cy
    if (cy=== null)
      return
    var b64key = 'base64,';
    var content = cy.png({output:'blob', full:true})
    // var b64 = content.substring( content.indexOf(b64key) + b64key.length );
    // var imgBlob = b64toBlob( b64, 'image/png' );
    saveAs( content, 'frank_graph.png' );
  }

  onEditorChange(newValue) {
    var alist = this.state.alist
    try{
      alist = JSON.parse(newValue)
    }catch(err){}
    this.setState({editorAlist:newValue, alist:alist})
  }

  

  render() {
    var whiteBgStyle = { borderRadius: '0px', background: 'white', padding: '5px', marginBottom: 0 }
    var alistBgStyle = {
      borderRadius: '0px', padding: '5px', background: '#E7E9EC',
      border: 'none', color: '#fff'
    }
    const { activeIndex } = this.state


    return (
      <div>
        <Menu stackable inverted={this.state.questionView}  secondary 
                style={{borderRadius: '0px', margin: '0px', minHeight:'60px', background:this.state.questionView?'#2D3142':'#FFFFFF', zIndex: 9909 }}>
          <Menu.Item header>
              <Header as='h1' style={{color:'#c1d2e1'}}>
                <Image src={require('./../frank-logo.png')} centered style={{width: 90}}/>
              </Header>
          </Menu.Item>
          <Menu.Item>
              <Header.Subheader  style={{color:this.state.questionView?'#c1d2e1':'#2D3142', paddingBottom:10}}>
                {this.state.questionView ? 
                  <span style={{fontSize:17, fontWeight:400}}>Functional Reasoner for Acquiring New Knowledge</span> : 
                  <span><span style={{fontSize:17, fontWeight:400, marginRight: 30, color:'#009999', float:'left'}}>Inference Explorer</span> 
                <div style={{whiteSpace: "nowrap", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", float:"left"}}>
                  {this.state.query}
                </div>               
                </span>}
                </Header.Subheader>
              {/* {this.state.questionView &&
              <Label size='tiny' style={{
                background:this.state.questionView?'#252937':'#E8EAED',
                color:this.state.questionView?'#7B8893':'#6E6E6E', marginBottom: 10 }}>v 0.2.0</Label>
              } */}
              {this.state.inferenceGraphView && (this.state.loadingSelectedAlist || this.state.loading) &&
                  <Image src='loading.svg' size='mini' style={{ float: 'left', objectFit: 'cover', height: '20px', marginLeft: 10 }} />
              }  
          </Menu.Item>
          
          {this.state.inferenceGraphView &&
            <Menu.Menu stackable inverted={this.state.questionView} secondary position='right'>
              {/* <Menu.Item as={Checkbox} toggle label='auto refresh' checked={this.state.autorefresh_graph} onChange={(e,d)=>{this.setState({autorefresh_graph: d.checked})} } /> */}
              <Menu.Item  onClick={()=>{this.checkForAnswer(); this.setState({answer_data_last_changed:new Date().getSeconds()})} } >
                <Icon name='refresh' />
                Refresh
              </Menu.Item>
              {this.state.cy !== null &&
              <Menu.Item  onClick={()=>this.handleDownloadInferenceGraph()} >
                <Icon name='download' />
              </Menu.Item>
              }
              <Menu.Item onClick={()=>this.setState({questionView:true, inferenceGraphView:false})} >
                <Icon name='edit outline' />
                Return to question
              </Menu.Item>
            </Menu.Menu>
          }
          
          
        </Menu>

        {/* Question view */}
        {this.state.questionView &&
          <div>
           
            
          <Segment inverted secondary style={{ borderRadius: '0px', margin: '0px', background: '#2D3142' }}>
          
            <div style={{ maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto' }}>
                <Label as='a' content='Try these examples' icon='info'
                onClick={() => this.setState({ examplesOpen: true })} style={{
                  marginBottom: 5, float: 'right',
                  background: '#252937', color: '#7B8893'
                }} />
              <div style={{ clear: 'both' }} />
                {this.state.nlView &&
        
                        
                        <Form style={{ marginBottom: 0 }} /*onSubmit={this.handleRIFQuery.bind(this, false)}*/>
                          <Form.Input className='no_input_focus'
                            value={this.state.query}
                            style={whiteBgStyle} size='large' transparent
                            placeholder='Type your question...'
                            action={
                              <Button.Group>
                                <Popup basic inverted position='bottom center' style={{padding:3, fontSize:12}}
                                  content='Switch to alist (formal) input'
                                  trigger={<Button basic onClick={()=>{this.setState({nlView:false})}} icon type='button'
                                    style={{ borderRadius: '0px', marginLeft: '8px' }} size='large' >
                                    <Icon name='code' color='grey' />
                                  </Button>
                                  } 
                                />
                                <Button onClick={this.handleRIFQuery.bind(this, false)} color='orange' icon
                                  style={{ borderRadius: '0px', marginLeft: '2px' }} size='large'>
                                  <Icon name='search' />
                                </Button>
                              </Button.Group>

                            }
                            list='templates'
                            onChange={this.handleChangeQuery.bind(this)}
                          />
                          {this.state.query.trim() !== "" &&
                            <div>
                              <div style={{ background: '#404353', padding: 10, paddingTop: 20, marginTop: '-14px' }}>

                              
                                <p style={{ fontSize: 13, fontWeight: '700', color: '#A9BAC9' }}>
                                  Generated Alist
                                <Popup inverted trigger={
                                    <Icon size='large' color='orange' name='question circle' style={{ marginTop: '-5px', marginLeft: '5px' }} />
                                  }
                                    content={<p> An alist is a set of attribute-value pairs. It is the internal formal representation of questions and data in FRANK.
                                  Attribute names:<ul>
                                        <li>h = operation</li>
                                        <li>v = operation variable</li>
                                        <li>s = subject</li>
                                        <li>p = property (or predicate)</li>
                                        <li>o = object</li>
                                        <li>t = time</li>
                                        <li>u = uncertainty</li>
                                        <li>xp = explanation</li>
                                      </ul></p>}
                                  />:
                              </p>
                                {/* <p style={{fontSize:13, fontWeight:'400', color:'#A9BAC9'}}>{this.state.alist_string}</p> */}
                                <ReactJson src={this.state.alist} theme='monokai'
                                  displayDataTypes={false} displayObjectSize={false} name={false} collapsed={true}
                                  style={{ padding: 10, background: '#404353', fontSize: 11 }} />
                              </div>
                            </div>
                          }
                        </Form>
                  }
                  {this.state.nlView === false &&
                    <div style={{background:'#FFF', paddingBottom: 5, paddingRight: 5}}>
                      <div style={{width:'100%', padding:8, background:'#E8E8E8', color:'#606469', fontSize:13}}>
                        Enter formal alist query
                      </div>
                      <AceEditor
                        mode="json"
                        theme="github"
                        onChange={this.onEditorChange.bind(this)}
                        name="alist_editor"
                        value={this.state.editorAlist}
                        editorProps={{ $blockScrolling: true }}
                        minLines={5} maxLines={50}
                        fontSize={16}
                        width='100%'
                        showPrintMargin={false}
                        wrapEnabled={true}
                      />
                      <Button.Group style={{float:'right'}}>
                        <Popup basic inverted position='bottom center' style={{padding:3, fontSize:12}}
                          content='Switch to natural language text input'
                          trigger= {                          
                              <Button basic onClick={()=>{this.setState({nlView:true})}} icon
                                style={{ borderRadius: '0px', marginLeft: '8px' }} size='large'>
                                <Icon name='font' color='grey' size='small'/> 
                              </Button>
                          }
                        />
                        <Button onClick={this.handleRIFQuery.bind(this, true)} color='orange' icon
                          style={{ borderRadius: '0px', marginLeft: '2px' }} size='large'>
                          <Icon name='search' />
                        </Button>
                      </Button.Group>
                      <div style={{clear:'both'}} />
                    </div>
                  }        
              
              <br />
            </div>
          </Segment>
        
          <Modal
            header='Examples of questions'
            centered={false}
            content={
              <div style={{ borderRadius: '0px', padding: '20px', border: 'none' }}>
                <List link >
                  {this.queryEx.map((ex, index) =>
                    <List.Item as='a' key={index} onClick={this.handleExItemClick}
                      style={{ color: 'black', fontSize: 15, margin: 5 }}>{ex}</List.Item>
                  )
                  }
                </List>
              </div>
            }
            open={this.state.examplesOpen}
            onClose={() => this.setState({ examplesOpen: false })}
            closeOnDimmerClick={true}
            closeOnEscape={true}
            actions={[{ key: 'close', content: 'Close', }]}
          />


          <Segment basic style={{ marginLeft: '0px', paddingTop: '0px', marginRight: '0px', marginTop: '35px' }}>
            {/* {this.state.loading && !this.state.final_answer_returned && !this.state.intermediate_answer_returned &&
              <Image src='loading.svg' centered size='tiny' />
            } */}
            <div style={{ clear: 'both' }} />
            {this.state.isError &&
              <div style={{
                borderRadius: '0px', padding: '20px',
                border: 'none', color: 'black', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto'
              }}>
                <span style={{ fontSize: 13 }}> <Icon name='exclamation triangle' color='yellow' size='large' /> {this.state.errorMessage} </span>
              </div>
            }
            {(this.state.final_answer_returned || this.state.intermediate_answer_returned) &&
              <Segment style={{
                borderRadius: '0px', paddingLeft: '20px', paddingBottom: 0,
                background: '#fff', border: 'none', color: 'black', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto'
              }}>
                {this.state.loading &&
                  <Image src='loading.svg' centered size='tiny' style={{ objectFit: 'cover', height: '30px', float: 'right' }} />
                }
                <div>
                  <div style={{ fontSize: 15, marginBottom: 10, marginTop: 10 }} >
                    {this.state.questionAnswered}
                  </div>
                  <Statistic style={{ float: 'left', marginRight: '30px', marginTop: '20px', marginBottom: 10, fontSize: '10px' }}>
                    <div style={{ fontSize: 40, fontWeight: '400' }} >{this.state.answer.answer}</div>
                  </Statistic>

                  {parseFloat(this.state.answer.error_bar) > 0 &&
                    <Statistic style={{ float: 'left', marginLeft: '10px', marginTop: '20px' }}>
                      <Statistic.Label > &plusmn; {this.state.answer.error_bar}</Statistic.Label>
                    </Statistic>
                  }
                </div>
                <div style={{ clear: 'both' }} />
                {/* <Statistic horizontal>
                  
                
                </Statistic> */}
                <br />
                <Label basic as='span' color='orange' style={{ marginTop: '2px', borderRadius:0, borderWidth:0, paddingLeft:0, marginRight:20, fontWeight:400 }}>
                  <Icon name='globe' />Source:
                  <Label.Detail style={{marginLeft: 3}}>{this.state.answer.sources}</Label.Detail>
                </Label>

                <Label basic as='span'  color='grey' style={{ marginTop: '2px', borderRadius:0, borderWidth:0, paddingLeft:0, fontWeight:400   }}>
                  <Icon name='hourglass end' />Time:
                  <Label.Detail style={{marginLeft: 3}}>{this.state.answer.elapsed_time}</Label.Detail>
                </Label>
                <div>
                  <div style={{marginBottom: 0, marginTop: 10, marginRight: 5, fontWeight: 600, fontSize: 12, float: "left", color: "#444" }}>Answer Alist</div>
                  <ReactJson src={this.state.answer.alist} theme='shapeshifter:inverted'
                    displayDataTypes={false} displayObjectSize={false} name={false} collapsed={true}
                    style={{marginBottom: 20, marginTop: 10,  background: '#FFF', fontSize: 11, float: "left" }} />
                  <div style={{clear: "both"}} />
                </div>
              </Segment>
              
            }

          {(this.state.final_answer_returned || this.state.intermediate_answer_returned) &&
              <Segment style={{
                borderRadius: '0px', paddingLeft: '20px', paddingBottom: 20,
                background: '#fff', border: 'none', color: 'black', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto'
              }}>
                
                {/* {JSON.stringify(this.state.answer.alist)} */}
                {isNullOrUndefined(this.state.answer.alist.xp) === false &&
                  <div>
                    <div style={{fontWeight:600}}><Icon name='idea' size='large' color= 'grey'/><span style={{color:'#333333'}}>Explanation</span></div> 
                    <div style={{marginTop: 10, marginLeft: 30, color:'#333333'}}>
                      {this.state.answer.alist.what!== undefined && this.state.answer.alist.what.length > 0 &&
                        <span>{this.state.answer.alist.what}</span>
                      }
                      {this.state.answer.alist.why!== undefined && this.state.answer.alist.why.length > 0 &&
                        <span>{' ' + this.state.answer.alist.why}</span>
                      } 
                      {this.state.answer.alist.how!== undefined && this.state.answer.alist.how.length > 0 &&
                        <span>{' ' + this.state.answer.alist.how}</span>
                      } 
                      {this.state.answer.alist.sources!== undefined && this.state.answer.alist.sources.length > 0 &&
                        <span>{' ' + this.state.answer.alist.sources}</span>
                      } 
                    </div>
                  </div>
                  
                }
              </Segment>
            }

            {/* {(this.state.final_answer_returned || this.state.intermediate_answer_returned) && */}
            {(this.state.currentCount > 0) &&
              <div style={{maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto', marginTop:20}}>
                <Button basic color='white' icon='sitemap' content='Inference Graph'
                  style={{borderRadius:0, background:'transparent'}}
                  onClick={()=>{this.setState({inferenceGraphView:true, questionView:false, alist_node: {}, 
                            explanation:{all:'', what:'', how:'', why:'',sources:''}, loadingSelectedAlist: false}, ()=>this.checkForAnswer())}
                  }>
                </Button>
                            

                <Modal
                  trigger={<Button basic color='white' icon='align left' content='Trace'
                              style={{borderRadius:0, background:'transparent'}} onClick={()=>this.setState({traceOpen:true})}></Button>}
                  centered={false}
                  open={this.state.traceOpen}
                  onClose={() => this.setState({ traceOpen: false })}
                  closeOnDimmerClick={true}
                  closeOnEscape={true}
                  size='fullscreen' dimmer='blurring'
                >
                  <Modal.Header>Inference Trace</Modal.Header>
                  <Modal.Content scrolling>
                    <div style={{ borderRadius: '0px', padding: '20px', border: 'none' }}>
                      <List divided relaxed size='tiny'>
                          {isNullOrUndefined(this.state.answer.trace) === false ?
                            this.state.answer.trace.map((item, index) => { return <List.Item key={index} >{item}</List.Item> })
                            : ""}
                      </List>
                    </div>
                  </Modal.Content>
                  <Modal.Actions>
                    <Button onClick={() => this.setState({ traceOpen: false })}>
                      Close
                    </Button>
                  </Modal.Actions>
                </Modal>

              </div>
            }
            {this.state.loading && !this.state.final_answer_returned && !this.state.intermediate_answer_returned &&
              <Image src='loading.svg' centered size='tiny' />
            }

            {!this.state.final_answer_returned && this.state.timedOut && !this.state.isError &&
              <div style={{
                borderRadius: '0px', paddingLeft: '0px',
                border: 'none', color: 'black', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto'
              }}>
                <div style={{ padding: 10, paddingLeft: 0, color: 'orange' }}>
                  <span> <Icon name='clock' style={{ fontSize: 20 }} /> FRANK timed out.</span>

                </div>

              </div>
            }
          </Segment>
        </div>
        }
        
        {/* Inference graph view */}
        {this.state.inferenceGraphView &&
          <Sidebar.Pushable as={Segment} style={{borderWidth:0, margin:0, marginBottom:'-60px', borderRadius:0, height:'100vh', width:'100%', overflow:'hidden', 
            position: 'absolute', bottom:0, zIndex: 1}}>
            <Sidebar
              as={Segment}
              animation='overlay'
              direction='left'
              visible={this.state.sidebarVisible}
              width='very wide'
              style={{borderWidth:0, margin:0, borderRadius:0, width:540, position:'absolute', bottom:0, paddingBottom:65}}
            >
              <div style={{
                  borderRadius: '0px', paddingLeft: '10px', marginTop: 0, marginBottom: 0,
                  border: 'none', color: '#000', minHeight: 50
                }}>

                  <Button color='white' onClick={()=>this.setState({sidebarVisible: false})} icon='angle left' content='Hide'
                    style={{borderRadius:0, marginTop:'-10px', background: 'transparent', paddingLeft: 0}} /> 

                  <div style={{paddingTop: 10, marginBottom:15}}>
                    <div  style={{marginLeft: 0, paddingTop:0, paddingBottom:10}}>Explanation Blanket Lengths:</div>
                    <div>
                      <div style={{float:'left', marginRight:10}}>
                        <BlanketInput onChange={this.handleAnscestorBlanketLengthChange.bind(this)} label='Ancestors'
                           value={this.state.ancestorBlanketLength} defaultValue={1} background='#eaf6f6'/></div>
                      <div style={{float:'left'}}><BlanketInput onChange={this.handleDescendantBlanketLengthChange.bind(this)} label='Descendants' 
                           value={this.state.descendantBlanketLength} defaultValue={1} background='#fdf3ec'/></div>
                      <div style={{clear:'both'}} />
                    </div>
                  </div>
                              

                  <div style={{ clear: 'both' }} />
                      {this.state.loadingSelectedAlist &&
                            <Image src='loading.svg' size='mini' style={{ objectFit: 'cover', height: '30px', marginLeft: 10 }} />
                      }
  
                      {!this.state.loadingSelectedAlist && this.state.alist_node &&
                        <div> 
                          <div>
                            { (this.state.explanation.what.length > 0 || this.state.explanation.how.length > 0 || this.state.explanation.why.length > 0 || this.state.explanation.sources.length > 0 ) &&
                              <span style={{fontWeight: 600}}>Explanation: </span>
                            }
                            {this.state.explanation.what.length > 0 &&
                              <span>{this.state.explanation.what}</span>
                            }
                            {this.state.explanation.why.length > 0 &&
                              <span>{' WHY: ' + this.state.explanation.why}</span>
                            } 
                            {this.state.explanation.how.length > 0 &&
                              <span>{' HOW: ' + this.state.explanation.how}</span>
                            } 
                            {this.state.explanation.sources !== undefined && this.state.explanation.sources.length > 0 &&
                              <span>{' ' + this.state.explanation.sources}</span>
                            } 
                            
                          </div>
                          
                          <div style={{clear:'both', marginTop:15}} />
                          {!this.state.loadingSelectedAlist && this.state.alist_node.h === "regress" && 
                            <FrankChart alist={this.state.alist_node} />
                          }
                          {Object.keys(this.state.alist_node).length > 0 &&
                            // <div style={{ float: 'left', marginBottom:10 }}><span style={{fontWeight: 600}}>Alist: </span>{JSON.stringify(this.state.alist_node)}</div>
                            <div>
                              <div style={{fontWeight: 600, marginTop:30}}>Selected node alist</div>
                              <ReactJson src={this.state.alist_node} theme='shapeshifter:inverted'
                                displayDataTypes={false} displayObjectSize={false} name={false} collapsed={false}
                                style={{ padding: 10, background: '#FFF', fontSize: 11 }} />
                            </div>
                          }
                        </div>
                      }
                                          
                </div>
            </Sidebar>
            <Sidebar.Pusher>
            <div>
            {
              // (this.state.final_answer_returned || this.state.intermediate_answer_returned) &&
              isNullOrUndefined(this.state.answer.graph_nodes) === false &&
              isNullOrUndefined(this.state.answer.graph_edges) === false &&
              this.state.answer.graph_nodes.length > 0 &&
              <div style={{background: '#F7F7F7', position:'absolute', bottom:0, width:'100%'}}>
                
                
                <Button.Group style={{borderRadius:0, marginLeft: this.state.sidebarVisible? 65 : 0, position:'absolute', zIndex:9999 }}>
                  {this.state.sidebarVisible === false &&
                    <Button onClick={()=>this.setState({sidebarVisible: !this.state.sidebarVisible})} icon='bars' style={{borderRadius:0}} />
                  }
                  {/* <Button onClick={()=>this.checkForAnswer.bind(this)} icon='refresh' style={{borderRadius:0}} /> */}
                </Button.Group>
                
                <CytoscapeGraph 
                  data={{nodes: this.state.answer.graph_nodes, edges: this.state.answer.graph_edges}} 
                  height='100vh'
                  handleNodeClick={this.handleNodeClick.bind(this)} 
                  handleUpdateCyObj={this.handleUpdateCyObj.bind(this)} 
                  lastChanged={this.state.answer_data_last_changed} />
              </div>
            }
            </div>
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        }
      </div>
    );
  }
}

export default Home;
