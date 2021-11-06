import React, { Component } from 'react';
import ReactFlow, {
  removeElements,
  addEdge,
  MiniMap,
  Controls,
  Background,
} from 'react-flow-renderer';
import CustomFlowFnode from './CustomFlowFnode';

const nodeTypes = {
  fnode: CustomFlowFnode,
};

class InferenceFlowGraph extends Component {
  constructor() {
    super();
    this.state = { data: [],
      // [{"id": "0", "data": {"label": "value"}, "position": {"x": 950.0, "y": 50}, "type": "input", "style": {"width": 80}}, {"id": "0_", "data": {"label": "value"}, "position": {"x": 1325.0, "y": 1164.285714285714}, "type": "output", "style": {"width": 80}}, {"id": "101", "data": {"label": "normalize"}, "position": {"x": 575.0, "y": 135.71428571428572}, "style": {"width": 80}}, {"id": "101_", "data": {"label": "comp"}, "position": {"x": 575.0, "y": 392.85714285714283}, "style": {"width": 80}}, {"id": "21011", "data": {"label": "value"}, "position": {"x": 575.0, "y": 221.42857142857142}, "style": {"width": 80}}, {"id": "21011_", "data": {"label": "value"}, "position": {"x": 575.0, "y": 307.1428571428571}, "style": {"width": 80}}, {"id": "102", "data": {"label": "VALUE"}, "position": {"x": 1325.0, "y": 478.5714285714285}, "style": {"width": 80}}, {"id": "102_", "data": {"label": "VALUE"}, "position": {"x": 1325.0, "y": 1078.5714285714282}, "style": {"width": 80}}, {"id": "21021", "data": {"label": "VALUE"}, "position": {"x": 1325.0, "y": 564.2857142857142}, "style": {"width": 80}}, {"id": "21021_", "data": {"label": "VALUE"}, "position": {"x": 1325.0, "y": 992.8571428571425}, "style": {"width": 80}}, {"id": "3210211", "data": {"label": "temporal"}, "position": {"x": 1325.0, "y": 649.9999999999999}, "style": {"width": 80}}, {"id": "3210211_", "data": {"label": "regress"}, "position": {"x": 1325.0, "y": 907.1428571428569}, "style": {"width": 80}}, {"id": "432102111", "data": {"label": "value"}, "position": {"x": 991.6666666666666, "y": 735.7142857142856}, "style": {"width": 80}}, {"id": "432102111_", "data": {"label": "value"}, "position": {"x": 991.6666666666666, "y": 821.4285714285712}, "style": {"width": 80}}, {"id": "432102112", "data": {"label": "value"}, "position": {"x": 1075.0, "y": 735.7142857142856}, "style": {"width": 80}}, {"id": "432102112_", "data": {"label": "value"}, "position": {"x": 1075.0, "y": 821.4285714285712}, "style": {"width": 80}}, {"id": "432102113", "data": {"label": "value"}, "position": {"x": 1158.3333333333335, "y": 735.7142857142856}, "style": {"width": 80}}, {"id": "432102113_", "data": {"label": "value"}, "position": {"x": 1158.3333333333335, "y": 821.4285714285712}, "style": {"width": 80}}, {"id": "432102114", "data": {"label": "value"}, "position": {"x": 1241.6666666666667, "y": 735.7142857142856}, "style": {"width": 80}}, {"id": "432102114_", "data": {"label": "value"}, "position": {"x": 1241.6666666666667, "y": 821.4285714285712}, "style": {"width": 80}}, {"id": "432102115", "data": {"label": "value"}, "position": {"x": 1325.0000000000002, "y": 735.7142857142856}, "style": {"width": 80}}, {"id": "432102115_", "data": {"label": "value"}, "position": {"x": 1325.0000000000002, "y": 821.4285714285712}, "style": {"width": 80}}, {"id": "432102116", "data": {"label": "value"}, "position": {"x": 1408.3333333333335, "y": 735.7142857142856}, "style": {"width": 80}}, {"id": "432102116_", "data": {"label": "value"}, "position": {"x": 1408.3333333333335, "y": 821.4285714285712}, "style": {"width": 80}}, {"id": "432102117", "data": {"label": "value"}, "position": {"x": 1491.666666666667, "y": 735.7142857142856}, "style": {"width": 80}}, {"id": "432102117_", "data": {"label": "value"}, "position": {"x": 1491.666666666667, "y": 821.4285714285712}, "style": {"width": 80}}, {"id": "432102118", "data": {"label": "value"}, "position": {"x": 1575.0000000000002, "y": 735.7142857142856}, "style": {"width": 80}}, {"id": "432102118_", "data": {"label": "value"}, "position": {"x": 1575.0000000000002, "y": 821.4285714285712}, "style": {"width": 80}}, {"id": "432102119", "data": {"label": "value"}, "position": {"x": 1658.3333333333337, "y": 735.7142857142856}, "style": {"width": 80}}, {"id": "432102119_", "data": {"label": "value"}, "position": {"x": 1658.3333333333337, "y": 821.4285714285712}, "style": {"width": 80}}, {"id": "e0101", "source": "0", "target": "101", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e0102", "source": "0", "target": "102", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e10121011", "source": "101", "target": "21011", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e101_102", "source": "101_", "target": "102", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e2101121011_", "source": "21011", "target": "21011_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e21011_101_", "source": "21011_", "target": "101_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e10221021", "source": "102", "target": "21021", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e102_0_", "source": "102_", "target": "0_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e210213210211", "source": "21021", "target": "3210211", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e21021_102_", "source": "21021_", "target": "102_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e3210211432102111", "source": "3210211", "target": "432102111", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e3210211432102112", "source": "3210211", "target": "432102112", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e3210211432102113", "source": "3210211", "target": "432102113", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e3210211432102114", "source": "3210211", "target": "432102114", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e3210211432102115", "source": "3210211", "target": "432102115", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e3210211432102116", "source": "3210211", "target": "432102116", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e3210211432102117", "source": "3210211", "target": "432102117", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e3210211432102118", "source": "3210211", "target": "432102118", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e3210211432102119", "source": "3210211", "target": "432102119", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e3210211_21021_", "source": "3210211_", "target": "21021_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102111432102111_", "source": "432102111", "target": "432102111_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102111_3210211_", "source": "432102111_", "target": "3210211_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102112432102112_", "source": "432102112", "target": "432102112_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102112_3210211_", "source": "432102112_", "target": "3210211_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102113432102113_", "source": "432102113", "target": "432102113_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102113_3210211_", "source": "432102113_", "target": "3210211_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102114432102114_", "source": "432102114", "target": "432102114_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102114_3210211_", "source": "432102114_", "target": "3210211_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102115432102115_", "source": "432102115", "target": "432102115_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102115_3210211_", "source": "432102115_", "target": "3210211_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102116432102116_", "source": "432102116", "target": "432102116_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102116_3210211_", "source": "432102116_", "target": "3210211_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102117432102117_", "source": "432102117", "target": "432102117_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102117_3210211_", "source": "432102117_", "target": "3210211_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102118432102118_", "source": "432102118", "target": "432102118_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102118_3210211_", "source": "432102118_", "target": "3210211_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102119432102119_", "source": "432102119", "target": "432102119_", "arrowHeadType": "arrowclosed", "animated": true}, {"id": "e432102119_3210211_", "source": "432102119_", "target": "3210211_", "arrowHeadType": "arrowclosed", "animated": true}]
      }
    
  }

  componentDidMount(){
     this.setState({data: this.props.data})
  }

  componentDidUpdate(prevProps){

    if(prevProps.lastChanged !== this.props.lastChanged){
        this.setState({data: this.props.data})
      }
  }

  onLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  };

  // const [elements, setElements] = useState(initialElements);
  onElementsRemove = (elementsToRemove) => {
    var data = this.state.data
    var elements = removeElements(elementsToRemove, data);
    this.setState({data:elements})
  }
  onConnect = (params) => {
    var data = this.state.data
    var elements = addEdge(params, data);
    this.setState({data:elements})
  }

  onElementClick = (event, element) => {
    console.log(element)
    this.props.handleNodeClick(element['id']);
  }
  

  render() {  
    return (
      <div style={{height:'100vh', paddingTop:60, backgroundColor:'#fff'}}>
         <ReactFlow
            elements={this.state.data}
            onElementsRemove={this.onElementsRemove.bind(this)}
            onElementClick={this.onElementClick.bind(this)}
            onConnect={this.onConnect.bind(this)}
            onLoad={this.onLoad.bind(this)}
            nodeTypes={nodeTypes}
            snapToGrid={true}
            snapGrid={[15, 15]}
          >
            <MiniMap
              nodeStrokeColor={(n) => {
                // if (n.style.background) return n.style.background;
                if (n.type === 'input') return '#0041d0';
                if (n.type === 'output') return '#ff0072';
                if (n.type === 'default') return '#1a192b';

                return '#555';
              }}
              nodeColor={(n) => {
                // if (n.style?.background) return n.style.background;

                return '#eee';
              }}
              nodeBorderRadius={2}
            />
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>

      </div>
    );
  }
}

export default InferenceFlowGraph;
