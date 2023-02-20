import React, { memo } from 'react';

import { Handle } from 'react-flow-renderer';

export default memo(({ data, isConnectable }) => {
  return (
    <div style={{borderRadius:10, textAlign:'center', padding:3}}>
      <Handle
        type="target"
        position="top"
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <div style={{fontSize:10, marginLeft:'auto', marginRight:'auto', fontWeight:600, marginTop:0, paddingTop:0, lineHeight:'1.5em'}}>{data.op}</div>
      <div style={{fontSize:6, marginLeft:'auto', marginRight:'auto', fontWeight:200, marginTop:0, paddingTop:0, lineHeight:'1.5em'}}>
        {data.id}
      </div>
      <Handle
        type="source"
        position="bottom"
        id="a"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
});