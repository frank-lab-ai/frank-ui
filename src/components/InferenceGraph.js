import React, { Component } from 'react';
import { Segment } from 'semantic-ui-react';
import { Graph } from 'react-d3-graph';
import '../network.css'

class InferenceGraph extends Component {
  constructor() {
    super();
    this.state = { data: {}, alist_string:''}

    // this.state.data = {
    //   nodes: [
    //     {id: 'Harry'},
    //     {id: 'Sally'},
    //     {id: 'Alice'}
    //   ],
    //   links: [
    //       {source: 'Harry', target: 'Sally'},
    //       {source: 'Harry', target: 'Alice'},
    //   ]
    // };
    
  }


  onClickNode = function(nodeId) {    
    this.setState({alist_string : JSON.stringify(this.props.nodes.filter(x => x.id === nodeId)[0]) })
  };

  render() {  
    // const graphdata = {nodes: this.props.nodes, links: this.props.edges} 
    // //this.state.data = graphdata
    // this.setState({data : graphdata});   
    const myConfig = {
      "automaticRearrangeAfterDropNode": true,
      "height": 700,
      "highlightDegree": 1,
      "highlightOpacity": 1,
      "linkHighlightBehavior": true,
      "maxZoom": 1,
      "minZoom": 1,
      "nodeHighlightBehavior": true,
      "panAndZoom": true,
      "staticGraph": false,
      "width": window.innerWidth - 100,
      "node": {
        "color": "#e0ebeb",
        "fontColor": "black",
        "fontSize": 10,
        "fontWeight": "normal",
        "highlightColor": "#b3cccc",
        "highlightFontSize": 12,
        "highlightFontWeight": "normal",
        "highlightStrokeColor": "#476b6b",
        "highlightStrokeWidth": 2.5,
        "labelProperty": "id",
        "mouseCursor": "pointer",
        "opacity": 1,
        "renderLabel": true,
        "size": 400,
        "strokeColor": "#a3c2c2",
        "strokeWidth": 2.0,
        "svg": "",
        "symbolType": "circle"
      },
      "link": {
        "color": "#a3c2c2",
        "opacity": 1,
        "semanticStrokeWidth": false,
        "strokeWidth": 2.0,
        "highlightColor": "#476b6b"
      }
    };

    return (
      <div style={{background:'#fff'}}>
        <Segment style={{borderRadius:'0px', paddingLeft: '20px', background:'#1A625F', 
          border:'none', color:'#99E1DE', fontFamily:'Ubuntu Mono'}}>
            {this.state.alist_string}
        </Segment>
        <Graph
          id='graph-id' // id is mandatory, if no id is defined rd3g will throw an error
          data={{nodes: this.props.nodes, links: this.props.edges}}
          config={myConfig}
          onClickNode={this.onClickNode.bind(this)}
        />
      </div>
    );
  }
}

export default InferenceGraph;
