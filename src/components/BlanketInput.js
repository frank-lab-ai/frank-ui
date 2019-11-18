import React, { Component } from 'react';
import { Button, Select, Input, Segment } from 'semantic-ui-react';


class BlanketInput extends Component {
  constructor() {
    super();
  }

  componentDidMount(){
    
  }

  onValueChanged(e){
    if(isNaN(e.target.value)) return;    
    var value = parseInt(e.target.value);    
    if(isNaN(value)) return;   
    if (value > 0 && value <= 20) 
      this.props.onChange(value);
  }

  onIncrease(){  
    var value = this.props.value;
    value = value + 1;
    if (value > 0 && value <= 20)
      this.props.onChange(value);
  } 
  
  onDecrease(){
    var value = this.props.value;
    value = value - 1;
    if (value > 0 && value <= 20)
      this.props.onChange(value);
  }  

  render() {  
    return (
      <Segment compact style={{padding:5, paddingLeft:10, borderRadius:30, boxShadow:'none', borderStyle:'none', background:(this.props.background)}}> 
        <span style={{fontColor:'#333333', fontSize:13}}>{this.props.label}</span> 
        <Input size='mini' type='text' transparent style={{marginLeft:5}} defaultValue={this.props.defaultValue} value={this.props.value} onChange={this.onValueChanged.bind(this)}>
          <Button circular icon='minus' style={{'marginRight':10}} onClick={this.onDecrease.bind(this)} />
          <input style={{borderRadius:10, width:20}} />
          <Button circular icon='plus' onClick={this.onIncrease.bind(this)} />
        </Input>
      </Segment>
    );
  }
}

export default BlanketInput;
