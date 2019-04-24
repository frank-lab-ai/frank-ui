import React, { Component } from 'react';
import {
  ScatterChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

class FrankChart extends Component {
  constructor() {
    super();
    this.state = { data:[], prediction:[], curveData:[] }
  }

  componentDidMount(){
    this.processAlistPlot()
  }

  processAlistPlot(){
    var data=[]
    var prediction=[]
    var curveData = []
    try{
      var fnPlot = JSON.parse(this.props.alist.fp)
      data = fnPlot.data.map(d=> {return {x:d[0], y:d[1]} } ) 
      prediction = [{x:fnPlot.prediction[0], y:fnPlot.prediction[1]}]
      curveData = fnPlot.data.map(d=> {
        var i
        var x = d[0]
        var y = 0
        for (i=0; i < fnPlot.function.length; i++){
          y = y + (fnPlot.function[i] * Math.pow(x, i))
        }
        return {x:x, y:y}
      })
      curveData.push({x:fnPlot.prediction[0], y:fnPlot.prediction[1]})
    }
    catch(err){}
    this.setState({data, prediction, curveData})
  }

  render() {
    // const data = [
    //   { x: 100, y: 200, z: 200 },
    //   { x: 120, y: 100, z: 260 },
    //   { x: 170, y: 300, z: 400 },
    //   { x: 140, y: 250, z: 280 },
    //   { x: 150, y: 400, z: 500 },
    //   { x: 110, y: 280, z: 200 },
    // ];
    const RenderNoShape = (props)=>{ 
      return null; 
     }
    return (
      <div style={{marginLeft:'auto', marginRight:'auto'}}>
      {this.state.data.length > 0 && this.state.prediction.length > 0 &&
        <ScatterChart
          width={300}
          height={300}
          margin={{
            top: 20, right: 20, bottom: 20, left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="x" unit="" domain={['auto', 'auto']}/>
          <YAxis type="number" dataKey="y" name="y" unit="" domain={['auto', 'auto']}/>
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="fn" data={this.state.curveData} line={{stroke: '#F26202', strokeWidth: 1}} lineType="fitting" shape={<RenderNoShape />}  />
          <Scatter name="data" data={this.state.data} fill="#8884d8" />         
          
          <Scatter name="prediction" data={this.state.prediction} fill="#FF0000"/>
        </ScatterChart>
      }
      </div>
    );
  }
}

export default FrankChart;
