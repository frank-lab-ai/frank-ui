import React, { Component } from 'react';
import { Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Graph } from 'react-d3-graph';
import '../network.css'

class InferenceGraph extends Component {
  constructor() {
    super();
    this.state = { data: {}, alist_string:''}

    this.state.data = {
      nodes: [
        {id: 'Harry'},
        {id: 'Sally'},
        {id: 'Alice'}
      ],
      links: [
          {source: 'Harry', target: 'Sally'},
          {source: 'Harry', target: 'Alice'},
      ]
    };
  }

  onClickNode = function(nodeId) {
    this.setState({alist_string:nodeId})
  };

  render() {      
    const myConfig = {
      "automaticRearrangeAfterDropNode": true,
      "height": 700,
      "highlightDegree": 1,
      "highlightOpacity": 1,
      "linkHighlightBehavior": false,
      "maxZoom": 8,
      "minZoom": 1,
      "nodeHighlightBehavior": false,
      "panAndZoom": true,
      "staticGraph": false,
      "width": window.innerWidth - 100,
      "node": {
        "color": "#d3d3d3",
        "fontColor": "black",
        "fontSize": 10,
        "fontWeight": "normal",
        "highlightColor": "SAME",
        "highlightFontSize": 8,
        "highlightFontWeight": "normal",
        "highlightStrokeColor": "SAME",
        "highlightStrokeWidth": 1.5,
        "labelProperty": "id",
        "mouseCursor": "pointer",
        "opacity": 1,
        "renderLabel": true,
        "size": 300,
        "strokeColor": "none",
        "strokeWidth": 1.5,
        "svg": "",
        "symbolType": "circle"
      },
      "link": {
        "color": "#d3d3d3",
        "opacity": 1,
        "semanticStrokeWidth": false,
        "strokeWidth": 1.5,
        "highlightColor": "#d3d3d3"
      }
    };

    return (
      <div style={{background:'#fff'}}>
        <Segment style={{borderRadius:'0px', paddingLeft: '20px', background:'#6FD5D0', border:'none', color:'white'}}>
            {this.state.alist_string}
        </Segment>
        <Graph
          id='graph-id' // id is mandatory, if no id is defined rd3g will throw an error
          data={this.state.data}
          config={myConfig}
          onClickNode={this.onClickNode.bind(this)}
        />
      </div>
    );
  }
}

export default InferenceGraph;
