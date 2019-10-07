import React, { Component } from 'react';
import { Button, Icon, Segment, Form, Modal, List, Header, Statistic, Label, Tab, Image, Popup } from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import InferenceGraph from './InferenceGraph';
import FrankChart from './FrankChart';
import NumericInput from 'react-numeric-input';
import '../home.css'
import { isNullOrUndefined } from 'util';



class Home extends Component {
  constructor() {
    super();
    this.state = {
      query: '', templates: [], activeIndex: 10, alist: {}, alist_string: '',
      answer: {}, loading: false, final_answer_returned: false, partial_answer_returned: false, errorMessage: '', examplesOpen: false, sessionId: '',
      currentCount: 0, intervalId: null, timedOut: false, maxCheckAttempts: 100, questionAnswered: '', alist_node: {}, loadingSelectedAlist: false,
      blanketLength: 1, explanation:{all:'', what:'', how:'', why:''},
      plotData: {
        "p": "population",
        "fp": "{\"function\" :[-5.2617682627407867E8,294139.066666669], \"data\":[[2017.0, 6.7118648E7],[2016.0, 6.6706879333333336E7],[2015.0, 6.6486984E7],[2014.0, 6.6316092E7],[2013.0, 6.5969263E7],[2012.0, 6.56546795E7],[2011.0, 6.53431815E7],[2010.0, 6.50253245E7],[2009.0, 6.47049825E7]]}",
        "h": "regress", "o": "?y0", "v": "?y0", "t": "2026", "id": "102", "s": "France",
        "xp": " The predicted population value using a regression function based on values from past years is 6.97489227925927E7."
      }
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
    // this.server_host = "34.242.204.151"; //;"remote"
    this.server_host = "localhost"; //;"localhost"
    this.webui_api_endpoint = "http://" + this.server_host + ":5005";
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
    fetch(this.webui_api_endpoint + '/template/' + queryStr, {})
      .then(result => result.json())
      .then(response => this.updateAlistAndTemplates(response))
      .catch(err => this.setState({ currentCount: 0, isError: true, errorMessage: "Sorry. The FRANK reasoner is currently offline.", loading: false }))
    //}
  }




  handleRIFQuery() {
    if (this.state.query.trim().length === 0) return;
    if (!Object.keys(this.state.alist).length) {
      this.setState({ isError: true, errorMessage: "FRANK was unable to parse your questions. Can you rephrase?" })
      return;
    }
    const sessionId = this.generateQuickGuid()
    this.setState({
      loading: true, final_answer_returned: false, partial_answer_returned: false, answer: {}, sessionId,
      currentCount: this.state.maxCheckAttempts, timedOut: false, isError: false, questionAnswered: this.state.query, alist_node: {},
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
      var intervalId = setInterval(this.timer, 3000);
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
    if (newCount >= 0) {
      this.checkForAnswer()
      this.setState({ currentCount: newCount });
    } else {
      clearInterval(this.state.intervalId);
      this.setState({ timedOut: true, loading: false })
    }
  }

  generateQuickGuid() {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }


  updateAlistAndTemplates(data) {
    // console.log(data)
    this.setState({ template: data['template'], alist: data['alist'], alist_string: data['alist_string'], question: data['question'], isError: false })
  }

  displayAnswer(data) {
    if (data.answer !== undefined) {
      clearInterval(this.state.intervalId);  // stop timer for checks
      this.setState({ answer: data, final_answer_returned: true, loading: false, isError: false })
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

    this.setState({
      answer: answer,
      final_answer_returned: isFinal,
      loading: !isFinal,
      isError: false,
      partial_answer_returned: !isNullOrUndefined(data.partial_answer) && !isNullOrUndefined(data.partial_answer.alist)
    })
  }

  handleNodeClick(nodeId) {
    this.setState({ loadingSelectedAlist: true })
    fetch(`${this.frank_api_endpoint}/alist/${this.state.sessionId}/${nodeId}/blanketlength/${this.state.blanketLength}`, {})
      .then(result => result.json())
      .then(response => {
        this.setState({ alist_node: response.alist, explanation: response.explanation, loadingSelectedAlist: false })
      })
  }

  handleBlanketLengthChange(valAsNumber, valAsString, e){
    this.setState({blanketLength: valAsNumber})
  }


  render() {
    var whiteBgStyle = { borderRadius: '0px', background: 'white', padding: '5px', marginBottom: 0 }
    var alistBgStyle = {
      borderRadius: '0px', padding: '5px', background: '#E7E9EC',
      border: 'none', color: '#fff', fontFamily: 'Ubuntu Mono'
    }
    const { activeIndex } = this.state


    return (
      <div>
        <Segment inverted secondary style={{ borderRadius: '0px', margin: '0px', background: '#2D3142' }}>
          <div style={{ maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto' }}>
            <br />
            <Label as='a' content='Try these examples' icon='info'
              onClick={() => this.setState({ examplesOpen: true })} style={{
                marginBottom: 5, float: 'right',
                background: '#252937', color: '#7B8893'
              }} />
            <div style={{ clear: 'both' }} />
            <Form style={{ marginBottom: 0 }}>
              <Form.Input className='no_input_focus'
                value={this.state.query}
                style={whiteBgStyle} size='large' transparent
                placeholder='Type your question...'
                action={
                  <Button onClick={this.handleRIFQuery.bind(this)} color='orange' icon
                    style={{ borderRadius: '0px', marginLeft: '8px' }} size='large'>
                    <Icon name='search' />
                  </Button>
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
          {/* <Dimmer active={this.state.loading === true} inverted> */}
          {/* <Loader active={this.state.loading === true} inverted inline='centered' content='searching/calculating answer'/> */}
          {/* <Image src='loading.svg' centered/>
          </Dimmer> */}

          {/* <Header>Answer</Header> */}
          {this.state.loading && !this.state.final_answer_returned && !this.state.partial_answer_returned &&
            <Image src='loading.svg' centered size='tiny' />
          }
          <div style={{ clear: 'both' }} />
          {this.state.isError &&
            <div style={{
              borderRadius: '0px', padding: '20px',
              border: 'none', color: 'black', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto'
            }}>
              <span style={{ fontSize: 13 }}> <Icon name='exclamation triangle' color='yellow' size='large' /> {this.state.errorMessage} </span>
            </div>
          }
          {(this.state.final_answer_returned || this.state.partial_answer_returned) &&
            <Segment style={{
              borderRadius: '0px', paddingLeft: '20px', paddingBottom: 30,
              background: '#fff', border: 'none', color: 'black', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto'
            }}>
              {this.state.loading &&
                <Image src='loading.svg' centered size='tiny' style={{ objectFit: 'cover', height: '30px', float: 'right' }} />
              }
              <div>
                <div style={{ fontSize: 15, fontFamily: 'Ubuntu Mono', marginBottom: 10, marginTop: 10 }} >
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
              <Label as='a' small='true' color='orange' style={{ marginTop: '2px' }}>
                <Icon name='globe' />Sources
                <Label.Detail>{this.state.answer.sources}</Label.Detail>
              </Label>

              <Label as='a' small='true' color='grey' style={{ marginTop: '2px' }}>
                <Icon name='hourglass end' /> Elapsed Time
                <Label.Detail>{this.state.answer.elapsed_time}</Label.Detail>
              </Label>

            </Segment>
          }


          {/* {(this.state.final_answer_returned || this.state.partial_answer_returned) && this.state.answer.alist.xp !== undefined && this.state.answer.alist.xp &&
            <Segment style={{borderRadius:'0px', paddingLeft: '20px', 
              background:'#fff',border:'none', color:'black', maxWidth:'1000px', fontFamily:'Ubuntu Mono', marginLeft:'auto', marginRight:'auto'}}>
              <b>Explanation:</b>{ ' ' + this.state.answer.alist.xp}
            </Segment>
          } */}

          {(this.state.final_answer_returned || this.state.partial_answer_returned) &&
            <Segment style={{
              borderRadius: '0px', paddingLeft: '20px', paddingBottom: 0,
              background: '#fff', border: 'none', color: 'black', maxWidth: '1000px', fontFamily: 'Ubuntu Mono', marginLeft: 'auto', marginRight: 'auto'
            }}>
              <b>Answer Alist</b><br />
              {/* {JSON.stringify(this.state.answer.alist)} */}
              <ReactJson src={this.state.answer.alist} theme='shapeshifter:inverted'
                displayDataTypes={false} displayObjectSize={false} name={false} collapsed={true}
                style={{ padding: 10, background: '#FFF', fontSize: 11 }} />

            </Segment>
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


          {isNullOrUndefined(this.state.answer.trace) === false &&
            <Tab menu={{ secondary: true, pointing: true }} centered panes={
              [
                {
                  menuItem: 'Explanation', render: () =>
                    <Tab.Pane basic attached={false}>
                      {(this.state.final_answer_returned || this.state.partial_answer_returned) && this.state.answer.alist.xp !== undefined && this.state.answer.alist.xp &&
                        <Segment basic style={{ borderRadius: '0px', background: 'transparent', border: 'none', fontFamily: 'Ubuntu Mono' }}>
                          {isNullOrUndefined(this.state.answer.alist.xp) === false ?
                            this.state.answer.alist.xp : ""
                          }
                        </Segment>
                      }
                    </Tab.Pane>
                },
                {
                  menuItem: 'Trace', render: () =>
                    <Tab.Pane basic attached={false}>
                      <Segment basic style={{ borderRadius: '0px', background: 'transparent', border: 'none', fontFamily: 'Ubuntu Mono' }}>
                        <List divided relaxed size='tiny'>
                          {isNullOrUndefined(this.state.answer.trace) === false ?
                            this.state.answer.trace.map((item, index) => { return <List.Item key={index} >{item}</List.Item> })
                            : ""}
                        </List>
                      </Segment>
                    </Tab.Pane>
                },
                {
                  menuItem: 'Inference Tree', render: () =>
                    <Tab.Pane basic attached={false} style={{ paddingTop: 0 }}>
                      {(this.state.final_answer_returned || this.state.partial_answer_returned) &&
                        isNullOrUndefined(this.state.answer.graph_nodes) === false &&
                        isNullOrUndefined(this.state.answer.graph_edges) === false &&
                        this.state.answer.graph_nodes.length > 0 &&
                        <div>
                          <Segment style={{
                            borderRadius: '0px', paddingLeft: '20px', marginTop: 0, marginBottom: 0, background: '#fff',
                            border: 'none', color: '#000', fontFamily: 'Ubuntu Mono', minHeight: 50
                          }}>
                            {this.state.loadingSelectedAlist &&
                              <Image src='loading.svg' size='mini' style={{ float: 'left', objectFit: 'cover', height: '20px' }} />
                            }
                            {!this.state.loadingSelectedAlist && this.state.alist_node &&
                              <div>                                
                                <div style={{marginTop: 5, marginBottom:10}}>
                                  <span  style={{float:'left', marginLeft: 0, paddingTop:0}}>Explanation Blanket Length:</span>
                                  <NumericInput min={1} max={30} value={this.state.blanketLength} onChange={this.handleBlanketLengthChange.bind(this)} 
                                    style={{input: {width:50}, float:'left', marginLeft: 7}}/>
                                </div>
                                <div style={{clear:'both', marginTop:10}} />
                                {Object.keys(this.state.alist_node).length > 0 &&
                                  <div style={{ float: 'left' }}><span style={{fontWeight: 600}}>Alist: </span>{JSON.stringify(this.state.alist_node)}</div>
                                }
                                <div style={{clear:'both', marginTop:10}} />
                                {this.state.explanation.all.length > 0 &&
                                  <div style={{ float: 'left' }}><span style={{fontWeight: 600}}>Explanation: </span>{this.state.explanation.all}</div>
                                }
                              </div>
                            }

                            <div style={{ clear: 'both' }} />
                            {!this.state.loadingSelectedAlist && <FrankChart alist={this.state.alist_node} />}
                          </Segment>

                          <InferenceGraph nodes={this.state.answer.graph_nodes} edges={this.state.answer.graph_edges} handleNodeClick={this.handleNodeClick.bind(this)} />
                        </div>

                      }
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
