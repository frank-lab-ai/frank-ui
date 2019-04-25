import React, { Component } from 'react';
import {
  ScatterChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

class FrankChart extends Component {
  constructor() {
    super();
    this.state = { data:[], prediction:[], curveData:[], yLabel:'', yUnit:'' }
  }

  componentDidMount(){
    this.processAlistPlot()
  }

  processAlistPlot(){
    var data=[]
    var prediction=[]
    var curveData = []
    var xArr = []
    var isRescale = ''
    var yLabel = 'y'
    var yUnit = ''
    try{
      var scale = 1000000000
      var fnPlot = JSON.parse(this.props.alist.fp)
      isRescale = fnPlot.prediction[1] > scale;
      data = fnPlot.data.map(d=> {
        xArr.push(d[0])
        var y = d[1]
        if(isRescale) y = y/scale
        return {x:d[0],y} 
      }) 
      xArr.push(fnPlot.prediction[0]) //add the prediction x value to the regression curve
      prediction = [{x:fnPlot.prediction[0], y:fnPlot.prediction[1]}]
      if(isRescale) {
        prediction = [{x:fnPlot.prediction[0], y:fnPlot.prediction[1]/scale}]
      }

      var xWidenDiff = (Math.max(...xArr) - Math.min(...xArr))/3
      xArr.push(...[Math.min(...xArr) - xWidenDiff, Math.max(...xArr)+xWidenDiff])      
      curveData = xArr.map(x=> {
        var i
        var y = 0
        for (i=0; i < fnPlot.function.length; i++){
          y = y + (fnPlot.function[i] * Math.pow(x, i))
        }         
        if(isRescale) y = y/scale
        return {x:x, y:y}
      })      
      curveData.push({x:prediction[0].x, y:prediction[1].y})
    }
    catch(err){}
    if(isRescale) {
      yLabel = 'y (in billions)'
      yUnit = 'e9'
    }
    this.setState({data, prediction, curveData, yLabel, yUnit})
  }

  render() {
    // const data = [
    //   { x: 100, y: 200, z: 200 },
    //   { x: 120, y: 100, z: 260 },
    //   { x: 110, y: 280, z: 200 },
    // ];
    const RenderNoShape = (props)=>{ 
      return null; 
     }
    return (
      <div style={{marginLeft:'auto', marginRight:'auto', width:510}}>
      {this.state.data.length > 0 && this.state.prediction.length > 0 &&
        <ScatterChart
          width={500}
          height={300}
          margin={{
            top: 20, right: 20, bottom: 20, left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="x" unit="" domain={['auto', 'auto']}/>
          <YAxis type="number" dataKey="y" name={this.state.ylabel} unit={this.state.yUnit} domain={['auto', 'auto']}/>
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
