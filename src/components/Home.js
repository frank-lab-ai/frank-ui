import React, { Component } from 'react';
import { Button, Icon, Segment, Form, Modal, List, Header, Statistic, Label, Tab, Image, Popup, Grid, Menu, Sidebar, Checkbox } from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import InferenceFlowGraph from './InferenceFlowGraph';
import FrankChart from './FrankChart';
import '../home.css'
import { isNullOrUndefined } from 'util';
import { saveAs } from 'file-saver';
import AceEditor from "react-ace";
import BlanketInput from './BlanketInput';
import {config} from '../config'

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
      query: '', templates: [], activeIndex: 10, fnode: {}, fnode_string: '',
      answer: {}, loading: false, final_answer_returned: false, intermediate_answer_returned: false, errorMessage: '', 
      examplesOpen: false, sessionId: '',
      currentCount: 0, intervalId: null, timedOut: false,
      maxCheckAttempts: 600, // 600 attempts with 3 seconds intervals = 30 hour before UI timeout. 
      answerCheckInterval: 3000, //3 seconds
      questionAnswered: '', fnode_node: {}, loadingSelectedFnode: false,
      ancestorBlanketLength: 1, descendantBlanketLength:1, explanation:{what:'', how:'', why:'', sources:''}, traceOpen:false,
      plotData:{}, questionView:false, inferenceGraphView:true, sidebarVisible: true, cy: null,
      nlView: true, editorFnode:'{"h":"value"}', autorefresh_graph:true,
      answer_data_last_changed:new Date().getTime(),
      defaultContext:[
        {},
        {
          // place:'London', 
          // device:'computer',
          // datetime:'2020-09-05 00:00:00'
        },
        {}
      ]   
    }

    this.templates = [];
    this.queryEx = [
      "What was the gdp of Ghana in 1998?",
      "What is the population of France in 2026?",
      "What is the capital of the United Kingdom?",
      "What was the population in 2005 of the country in Europe with the highest gdp in 2010?",
      "country with the largest population in 1998",
      "country in Europe with the lowest population in 2010"
    ]
    this.frank_api_endpoint = `http://${config.frank_server_host}:${config.frank_server_port}`;
    this.timer = this.timer.bind(this);
  }

  componentDidMount() {
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
      this.setState({ fnode: {}, fnode_string: "" })
    this.getQueryFnode(queryStr)
  }

  handleFnodeChange(e) {
    var fnode_json = {}
    try {
      fnode_json = JSON.parse(e.target.value)
    }
    catch (e) {
      console.log("Invalid json format")
    }
    this.setState({ fnode_string: e.target.value, fnode: fnode_json })
  }


  handleExItemClick = (e, listItemProps) => {
    const { children } = listItemProps
    this.setState({ query: children, activeIndex: 10, examplesOpen: false }) //change active index to close accordion
    this.getQueryFnode(children)
  }

  getQueryFnode(queryStr) {
    if (queryStr.trim().length === 0) return;
    fetch(this.frank_api_endpoint + '/template/' + queryStr, {})
      .then(result => result.json())
      .then(response => this.updateFnodeAndTemplates(response))
      .catch(err => this.setState({ currentCount: 0, isError: true, errorMessage: "Sorry. The FRANK reasoner is currently offline.", loading: false }))
    //}
  }

  handleQuery(isFnodeEditor) {
    if (isFnodeEditor){
      this.setState({query: this.state.editorFnode})
    }
    if (this.state.query.trim().length === 0) return;
    if (!Object.keys(this.state.fnode).length) {
      this.setState({ isError: true, errorMessage: "FRANK was unable to parse your questions. Can you rephrase?" })
      return;
    }
    const sessionId = this.generateQuickGuid()
    this.setState({
      loading: true, final_answer_returned: false, partial_answer_returned: false, answer: {}, sessionId,
      currentCount: this.state.maxCheckAttempts, timedOut: false, isError: false, 
      questionAnswered: isFnodeEditor? this.state.editorFnode : this.state.query, 
      fnode_node: {},
      loadingSelectedFnode: false
    }, () => {
      const { fnode } = this.state
      if(!('cx' in fnode)){
        fnode['cx'] = this.state.defaultContext;
      }
      fetch(this.frank_api_endpoint + "/query", {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fnode: fnode, sessionId: sessionId, question: this.state.query })
      })
        .then(response => response.json())
        .then(result => {
          this.displayAnswer(result);
          this.checkForAnswer();
          }
        )
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


  updateFnodeAndTemplates(data) {
    this.setState({ template: data['template'], fnode: data['fnode'], fnode_string: data['fnode_string'], 
      question: data['question'], editorFnode: JSON.stringify(data['fnode'], null, 2), isError: false })
  }

  displayAnswer(data) {
    if (data.answer !== undefined && data.answer !== null) {
      clearInterval(this.state.intervalId);  // stop timer for checks
      this.setState({ answer: data, final_answer_returned: true, loading: false, isError: false, answer_data_last_changed:new Date().getTime() })
    }
  }

  displayProgressTrace(data) {
    var answer = this.state.answer;
    if (data.answer !== undefined && data.answer !== null){
      answer = data.partial_answer;
      answer.trace = data.trace;
    }
    answer.graph = data.graph
    var isFinal = data.answer !== undefined && data.answer !== null && data.answer.answer.length > 0
    if (isFinal)
      clearInterval(this.state.intervalId)
    var isError = this.state.isError
    if (isFinal || data.partial_answer === null || data.partial_answer === undefined)
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
      partial_answer_returned: !isNullOrUndefined(data.partial_answer) && !isNullOrUndefined(data.partial_answer.fnode),
      answer_data_last_changed:answer_last_changed
    })
    
  }

  handleNodeClick(nodeId) {
    this.setState({ loadingSelectedFnode: true })
    fetch(`${this.frank_api_endpoint}/fnode/${this.state.sessionId}/${nodeId}/blanketlengths/${this.state.ancestorBlanketLength}/${this.state.descendantBlanketLength}`, {})
      .then(result => result.json())
      .then(response => {
        this.setState({ fnode_node: response.fnode, explanation: response.explanation, loadingSelectedFnode: false, sidebarVisible:true })
      })
  }

  handleUpdateCyObj(cyObj){
    this.setState({cy: cyObj})
  }

  handleAnscestorBlanketLengthChange(value){
    this.setState({ancestorBlanketLength: value}, ()=>{
      if (this.state.fnode_node !== undefined && Object.keys(this.state.fnode_node).length > 0){
        this.handleNodeClick(this.state.fnode_node.id)
      }
    })
  }

  handleDescendantBlanketLengthChange(value){
    this.setState({descendantBlanketLength: value}, ()=>{
      if (this.state.fnode_node !== undefined && Object.keys(this.state.fnode_node).length > 0){
        this.handleNodeClick(this.state.fnode_node.id)
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
    var fnode = this.state.fnode
    try{
      fnode = JSON.parse(newValue)
    }catch(err){}
    this.setState({editorFnode:newValue, fnode:fnode})
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
        <Menu  secondary 
                style={{borderRadius: '0px', margin: '0px', minHeight:'60px', 
                background:'#FFFFFF', zIndex: 9909,
                position: 'absolute', width:'100%'}}>
          <Menu.Item header>
              {/* <Header as='h1' style={{color:'#c1d2e1'}}> */}
                {/* <Image src={require('./../frank-logo.png')} centered style={{width: 90}}/> */}
                
              {/* </Header> */}
              <div className='header_logo_name'><span style={{color:'#000', fontWeight:300}}>Deep</span> FRANK</div>
          </Menu.Item>
          <Menu.Item>
              <Header.Subheader  style={{color:'#2D3142', paddingBottom:10}}>
                
                {/* <span style={{fontSize:17, fontWeight:400}}>Functional Reasoner for Acquiring New Knowledge</span> */}
                {/* <span><span style={{fontSize:17, fontWeight:400, marginRight: 30, color:'#009999', float:'left'}}>Inference Explorer</span> 
                  <div style={{whiteSpace: "nowrap", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", float:"left"}}>
                    {this.state.query}
                  </div>               
                </span> */}
                </Header.Subheader>
              
          </Menu.Item>
          
          {this.state.inferenceGraphView &&
            <Menu.Menu stackable secondary position='right' >
              <Menu.Item>
              {this.state.inferenceGraphView && (this.state.loadingSelectedFnode || this.state.loading) &&
                  <Image src='loading.svg' size='mini' style={{ float: 'left', objectFit: 'cover', height: '20px', marginLeft: 10 }} />
              }  
              </Menu.Item>
                <Popup
                  wide
                  trigger={
                    <Menu.Item className="header_item"  onClick={() => {this.setState({ examplesOpen: true })}}>
                      Examples
                    </Menu.Item>}
                    content={
                    <div style={{ borderRadius: '0px', padding: '20px', border: 'none' }}>
                      <List link >
                        {this.queryEx.map((ex, index) =>
                          <List.Item as='a' key={index} onClick={this.handleExItemClick}
                            style={{ color: 'black', fontSize: 15, margin: 5, borderBottom:'1px solid #ccc' }}>{ex}</List.Item>
                        )
                        }
                      </List>
                    </div>
                  }
                  on='click'               
                  position='bottom center'
                  mouseLeaveDelay={1000}
                  style={{zIndex:9999}}
                />
              <Menu.Item className="header_item" onClick={()=>{this.checkForAnswer(); this.setState({answer_data_last_changed:new Date().getTime()})} } >
                <Icon name='refresh' />
                Refresh
              </Menu.Item>
              {/* {this.state.cy !== null &&
              <Menu.Item  onClick={()=>this.handleDownloadInferenceGraph()} >
                <Icon name='download' />
              </Menu.Item>
              } */}
            </Menu.Menu>
          }
          
          
        </Menu>

        {/* <Modal
            header='Examples of questions'
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
          /> */}

        {!this.state.sidebarVisible &&
        <Button size='tiny' style={{position:'absolute', top:70, left: 20, zIndex:2, borderRadius:20, background:'#2D3142', color:'#FFF'}}
          onClick={()=>this.setState({sidebarVisible: true})}>
            <Icon rotated='counterclockwise' name='window maximize outline' />
            View Query
        </Button>
        }
        

          <Sidebar.Pushable as={Segment} style={{borderWidth:0, margin:0, marginBottom:'-60px', borderRadius:0, 
            height:'100vh', width:'100%', overflow:'hidden', 
            position: 'absolute', bottom:0, top:0, zIndex: 1}}>
            <Sidebar
              animation='overlay'
              direction='left'
              visible={this.state.sidebarVisible}
              width='very wide'
              style={{borderWidth:0, margin:0, borderRadius:0, width:540, position:'absolute', bottom:0,
                 paddingBottom:65, background:'rgb(0,0,0,0)', overflow:'hidden !important', boxShadow: 'unset'}}
            >
    
              <div style={{
                  borderRadius: '0px', paddingLeft: '10px', marginTop: 0, marginBottom: 0,
                  border: 'none', color: '#000', minHeight: 50, overflow:'hidden !important'
                }}>
                  <Segment raised style={{marginTop:70, marginLeft:10, padding:0, maxHeight:"80vh", marginRight:10,
                    overflowX:'hidden', overflowY:'auto'}}>
                  <div style={{background: '#2D3142', width:'100%', padding:10}}>
                    <Button color='black' onClick={()=>this.setState({sidebarVisible: false})} icon='angle left' content='Hide'
                      style={{borderRadius:0, marginTop:'-10px', background: 'transparent', paddingLeft: 0, background:'#2D3142'}} /> 
                    </div>

                  {/* Query editor start */}
                  <div style={{background: 'rgb(100,100,100,0)',}}>            
                  <Segment basic inverted secondary style={{ borderRadius: '0px', marginTop: '0px', background: '#2D3142',
                    paddingTop:5, paddingBottom:0, maxWidth: '100%', marginLeft:'auto', marginRight:'auto', }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ clear: 'both' }} />
                        {this.state.nlView &&          
                            <Form style={{ marginBottom: 0 }} >
                              <Form.Input className='no_input_focus'
                                value={this.state.query}
                                style={whiteBgStyle} size='large' transparent
                                placeholder='Type your question...'
                                action={
                                  <Button.Group>
                                    <Popup basic inverted position='bottom center' style={{padding:3, fontSize:12}}
                                      content='Switch to fnode (formal) input'
                                      trigger={<Button basic onClick={()=>{this.setState({nlView:false})}} icon type='button'
                                        style={{ borderRadius: '0px', marginLeft: '8px' }} size='large' >
                                        <Icon name='code' color='grey' />
                                      </Button>
                                      } 
                                    />
                                    <Button onClick={this.handleQuery.bind(this, false)} color='orange' icon
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

                                  
                                    <p className='header_item' style={{ fontSize: 11, fontWeight: '400', color: '#A9BAC9' }}>
                                      Generated Query
                                    <Popup inverted trigger={
                                        <Icon size='large' color='orange' name='question circle' style={{ marginTop: '-5px', marginLeft: '5px' }} />
                                      }
                                        content={<p> An fnode is a set of attribute-value pairs. It is the internal formal representation of questions and data in FRANK.
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
                                    <ReactJson src={this.state.fnode} theme='monokai'
                                      displayDataTypes={false} displayObjectSize={false} name={false} collapsed={true}
                                      style={{ padding: 5, background: '#404353', fontSize: 11 }} />
                                  </div>
                                </div>
                              }
                            </Form>
                          }
                          {this.state.nlView === false &&
                            <div style={{background:'#FFF', paddingBottom: 5, paddingRight: 5}}>
                              <div style={{width:'100%', padding:8, background:'#E8E8E8', color:'#606469', fontSize:13}}>
                                Enter formal fnode query
                              </div>
                              <AceEditor
                                mode="json"
                                theme="github"
                                onChange={this.onEditorChange.bind(this)}
                                name="fnode_editor"
                                value={this.state.editorFnode}
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
                                <Button onClick={this.handleQuery.bind(this, true)} color='orange' icon
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
                  
                  {(this.state.final_answer_returned || this.state.intermediate_answer_returned || this.state.isError || this.state.loading) &&
                  <Segment basic style={{ marginLeft: '0px', paddingTop: '0px', marginRight: '0px', marginTop: '0px', width: '100%' }}>
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
                          <Image src='loading.svg' centered size='mini' style={{ objectFit: 'cover', height: '10px', float: 'right' }} />
                        }
                        <div>
                          <div className='header_item' style={{ fontSize: 12, fontWeight: 400, marginBottom: 0, marginTop: 0, color:'#555' }} >
                            {/* {this.state.questionAnswered} */}
                            Answer:
                          </div>
                          <Statistic style={{ float: 'left', marginRight: '30px', marginTop: '10px', marginBottom: 10, fontSize: '10px' }}>
                            <div style={{ fontSize: 25, fontWeight: '400' }} >{this.state.answer.answer}</div>
                          </Statistic>

                          {parseFloat(this.state.answer.error_bar) > 0 &&
                            <Statistic style={{ float: 'left', marginLeft: '10px', marginTop: '10px',  }}>
                              <Statistic.Label style={{fontWeight:400}}> &plusmn; {this.state.answer.error_bar}</Statistic.Label>
                            </Statistic>
                          }
                        </div>
                        <div style={{ clear: 'both' }} />
                        
                        <Label basic as='span' color='orange' style={{ marginTop: '2px', borderRadius:0, borderWidth:0, paddingLeft:0, marginRight:20, fontWeight:400 }}>
                          <Icon name='globe' />Source:
                          <Label.Detail style={{marginLeft: 3}}>{this.state.answer.sources}</Label.Detail>
                        </Label>

                        <Label basic as='span'  color='grey' style={{ marginTop: '2px', borderRadius:0, borderWidth:0, paddingLeft:0, fontWeight:400   }}>
                          <Icon name='hourglass end' />Time:
                          <Label.Detail style={{marginLeft: 3}}>{this.state.answer.elapsed_time}</Label.Detail>
                        </Label>
                        <div>
                          <div style={{marginBottom: 0, marginTop: 10, marginRight: 5, fontWeight: 600, fontSize: 12, float: "left", color: "#444" }}>Answer Fnode</div>
                          <ReactJson src={this.state.answer.fnode} theme='shapeshifter:inverted'
                            displayDataTypes={false} displayObjectSize={false} name={false} collapsed={true}
                            style={{marginBottom: 20, marginTop: 10,  background: '#FFF', fontSize: 11, float: "left" }} />
                          <div style={{clear: "both"}} />
                        </div>
                      </Segment>
                      
                    }

                  {/* {(this.state.final_answer_returned || this.state.intermediate_answer_returned) &&
                      <Segment style={{
                        borderRadius: '0px', paddingLeft: '20px', paddingBottom: 20,
                        background: '#fff', border: 'none', color: 'black', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto'
                      }}>
                        
                        {isNullOrUndefined(this.state.answer.fnode.xp) === false &&
                          <div>
                            <div style={{fontWeight:600}}><Icon name='idea' size='large' color= 'grey'/><span style={{color:'#333333'}}>Explanation</span></div> 
                            <div style={{marginTop: 10, marginLeft: 30, color:'#333333'}}>
                              {this.state.answer.fnode.what!== undefined && this.state.answer.fnode.what.length > 0 &&
                                <span>{this.state.answer.fnode.what}</span>
                              }
                              {this.state.answer.fnode.why!== undefined && this.state.answer.fnode.why.length > 0 &&
                                <span>{' ' + this.state.answer.fnode.why}</span>
                              } 
                              {this.state.answer.fnode.how!== undefined && this.state.answer.fnode.how.length > 0 &&
                                <span>{' ' + this.state.answer.fnode.how}</span>
                              } 
                              {this.state.answer.fnode.sources!== undefined && this.state.answer.fnode.sources.length > 0 &&
                                <span>{' ' + this.state.answer.fnode.sources}</span>
                              } 
                            </div>
                          </div>
                          
                        }
                      </Segment>
                    } */}

                    {(this.state.currentCount > 0) &&
                      <div style={{maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto', marginTop:20}}>
                      </div>
                    }
                    {this.state.loading && !this.state.final_answer_returned && !this.state.intermediate_answer_returned &&
                      <Image src='loading.svg' centered size='mini' />
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
                  }
              </div>
                  {/* end of query bar */}

                  {/* {Object.keys(this.state.fnode_node).length > 0 && this.state.answer.graph !== undefined &&
                  <div style={{paddingTop: 10, margin: 10, marginLeft: 15, marginBottom:15}}>
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
                  }   */}

                  <div style={{ clear: 'both' }} />
                      {this.state.loadingSelectedFnode &&
                            <Image src='loading.svg' size='mini' style={{ objectFit: 'cover', height: '30px', marginLeft: 10 }} />
                      }
  
                      {!this.state.loadingSelectedFnode && this.state.fnode_node &&
                        <div style={{margin:0}}> 
                          {/* <div>
                            { (this.state.explanation.what.length > 0 || this.state.explanation.how.length > 0 || 
                               this.state.explanation.why.length > 0 || this.state.explanation.sources.length > 0 ) &&
                              <span style={{fontWeight: 600}}>Explanation: </span>
                            }
                            {this.state.explanation.what.length > 0 &&
                             <span>{this.state.explanation.what}</span>x
                            {this.state.explanation.why.length > 0 &&
                              <span>{' WHY: ' + this.state.explanation.why}</span>
                            } 
                            {this.state.explanation.how.length > 0 &&
                              <span>{' HOW: ' + this.state.explanation.how}</span>
                            } 
                            {this.state.explanation.sources !== undefined && this.state.explanation.sources.length > 0 &&
                              <span>{' ' + this.state.explanation.sources}</span>
                            } 
                            
                          </div> */}
                          
                          <div style={{clear:'both', marginTop:0}} />
                          {!this.state.loadingSelectedFnode && this.state.fnode_node.h === "regress" && 
                            <FrankChart fnode={this.state.fnode_node} />
                          }
                          {Object.keys(this.state.fnode_node).length > 0 &&
                            <div>
                              <div className='header_item' style={{fontSize:12, fontWeight:400, marginTop:30, marginLeft:12}}>Selected node</div>
                              <ReactJson src={this.state.fnode_node} theme='shapeshifter:inverted'  
                                displayDataTypes={false} displayObjectSize={false} name={false} collapsed={1} 
                                style={{ padding: 10, background: '#FFF', fontSize: 11 }} />
                            </div>
                          }
                        </div>
                      }
                  </Segment>
                                          
              </div>
            </Sidebar>
            <Sidebar.Pusher>
            <div>              
              <div style={{background: '#FFF', position:'absolute', bottom:0, width:'100%'}}>
                <InferenceFlowGraph data={this.state.answer.graph} 
                  handleNodeClick={this.handleNodeClick.bind(this)}
                  lastChanged={this.state.answer_data_last_changed} />
              </div>
            </div>
            </Sidebar.Pusher>
          </Sidebar.Pushable>


          
      </div>
    );
  }
}

export default Home;
