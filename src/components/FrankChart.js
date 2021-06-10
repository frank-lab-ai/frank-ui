import React, { Component } from 'react';
import Plot from 'react-plotly.js';

class FrankChart extends Component {
  constructor() {
    super();
    this.state = { data:[], prediction:[], curveData:[], 
                   dataX:[], predictionX:[], curveDataX:[],
                   dataY:[], predictionY:[], curveDataY:[],
                   yLabel:'', yUnit:'' }
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
      var dataX = [];
      var dataY = [];
      data = fnPlot.data.map(d=> {
        xArr.push(d[0])
        var y = d[1]
        if(isRescale) y = y/scale
        dataX.push(d[0])
        dataY.push(y)
        return {x:d[0],y} 
      }) 
      xArr.push(fnPlot.prediction[0]) //add the prediction x value to the regression curve
      prediction = [{x:fnPlot.prediction[0], y:fnPlot.prediction[1]}]      
      var predictionX = [fnPlot.prediction[0]];
      var predictionY = [fnPlot.prediction[1]];
      if(isRescale) {
        prediction = [{x:fnPlot.prediction[0], y:fnPlot.prediction[1]/scale}];
        predictionX = [fnPlot.prediction[0]];
        predictionY = [fnPlot.prediction[1]/scale];
      }

      var xWidenDiff = (Math.max(...xArr) - Math.min(...xArr))/3
      xArr.push(...[Math.min(...xArr) - xWidenDiff, Math.max(...xArr)+xWidenDiff])    
      var curveDataX = []  
      var curveDataY = []  
      curveData = xArr.map(x=> {
        var i
        var y = 0
        for (i=0; i < fnPlot.function.length; i++){
          y = y + (fnPlot.function[i] * Math.pow(x, i))
        }         
        if(isRescale) y = y/scale
        curveDataX.push(x)
        curveDataY.push(y)
        return {x:x, y:y}
      })      
      curveData.push({x:prediction[0].x, y:prediction[1].y})
      curveDataX.push(prediction[0].x)
      curveDataY.push(prediction[0].y)
    }
    catch(err){}
    if(isRescale) {
      yLabel = 'y (in billions)'
      yUnit = 'e9'
    }
    this.setState({data, prediction, curveData, yLabel, yUnit, 
      dataX, dataY, predictionX, predictionY, curveDataX, curveDataY})
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
        <Plot style={{padding:5, margin:0}}
          data={[
            {type: 'scatter', x: this.state.curveDataX, y: this.state.curveDataY, mode: 'lines', marker: {color: 'orange'}, name:'fn'},
            {type: 'scatter', x: this.state.dataX, y: this.state.dataY, mode: 'markers', marker: {color: 'orange'}, name:'data'},
            {type: 'scatter', x: this.state.predictionX, y: this.state.predictionY, mode: 'markers', marker: {color: 'green'}, name:'prediction' },
          ]}
          layout={{
            width: 500, height: 400, 
            showlegend:true,
            legend: {"orientation": "h"},
            margin:{l:50, r:20, b:50, pad: 0},
            title: {text: 'Prediction Plot', font:{size: 13}},
            xaxis: {autorange:true},
            yaxis: {autorange:true, title:this.state.ylabel}
          }}
        />
      }
      </div>
    );
  }
}

export default FrankChart;
