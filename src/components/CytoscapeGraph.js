import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import cydagre from 'cytoscape-dagre';
import cxtmenu from 'cytoscape-cxtmenu';

// cydagre(cytoscape);
// cxtmenu(cytoscape)
cytoscape.use(cydagre)
cytoscape.use( cxtmenu );

// let cyStyle = {
//     height: {this.props.height},
//     display: 'block'
// };

let  defaultNodeColor = "#F2711C"
let  selectedNodeColor = "#4E607A"
let conf = {
    // boxSelectionEnabled: true,
    // autounselectify: true,
    zoomingEnabled: true,
    minZoom: 0.5,
    maxZoom: 5,
    style: [
        {
            selector: 'node',
            style: {
                'content': 'data(label)',
                'text-opacity': 0.5,
                'text-valign': 'center',
                'text-halign': 'right',
                'font-size': 10,
                'background-color': defaultNodeColor
                    //function (ele) {
                    //const nodeData = ele.data();

                    // switch (nodeData.data.status) {
                    //     case 'SUCCESS':
                    //         return "#00b200";
                    //     case 'PENDING':
                    //         return "#737373";
                    //     case 'FAILURE':
                    //         return "#b20000";
                    //     case 'RECEIVED':
                    //         return "#e59400";
                    //     default:
                    //         return "#9366b4";

                    // }
               // }
            }
        },
        {
            selector: ':selected',
            style: {
                'content': 'data(label)',
                'text-opacity': 1.0,
                'background-color': selectedNodeColor
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 2,
                "curve-style": "bezier",
                'target-arrow-shape': 'triangle',
                'line-color': "#B2B2B2",
                'font-size': 10,
                'target-arrow-color': "gray[700]",
                "text-rotation": "autorotate",
                "text-margin-x": "2px",
                "text-margin-y": "2px",
                'label': 'data(label)',
                'background' :'white'
            }
        }
    ],
    layout: {
        name: 'dagre',
        fit: false,
    }
};

// let menu_defaults = {
//     menuRadius: 50, // the radius of the circular menu in pixels
//     selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
//     commands: [ // an array of commands to list in the menu or a function that returns the array
      
//       { // example command
//         fillColor: 'rgba(61,65,78, 0.80)', // optional: custom background color for item
//         content: "<img src='images/solution.png'  height='20px' width='20px' />", // html/text content to be displayed in the menu
//         // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
//         // select: function(ele){ // a function to execute when the command is selected
//         //   console.log( ele.id() ) // `ele` holds the reference to the active element
//         // },
//         enabled: true // whether the command is selectable
//       },
//       { // show children
//         fillColor: 'rgba(61,65,78, 0.80))', // optional: custom background color for item
//         content: "<img src='images/network.png' height='20px' width='20px' />", // html/text content to be displayed in the menu
//         // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
//         // select: function(ele){ // a function to execute when the command is selected
//         //   console.log( ele.id() ) // `ele` holds the reference to the active element
//         // },
//         enabled: true // whether the command is selectable
//       },
//       { // hide node
//         fillColor: 'rgba(61,65,78, 0.80))', // optional: custom background color for item
//         content: "<img src='images/visibility.png'  height='20px' width='20px' />", // html/text content to be displayed in the menu
//         // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
//         select: function(ele){ // a function to execute when the command is selected
//           console.log( ele.id() ) // `ele` holds the reference to the active element
//         },
//         enabled: true // whether the command is selectable
//       },
      
//     ], // function( ele ){ return [ /*...*/ ] }, // a function that returns commands or a promise of commands
//     fillColor: 'rgba(61,65,78, 0.80)', // the background colour of the menu
//     activeFillColor: 'rgba(0,153,153, 0.80)', // the colour used to indicate the selected command
//     activePadding: 15, // additional size in pixels for the active command
//     indicatorSize: 15, // the size in pixels of the pointer to the active command
//     separatorWidth: 2, // the empty spacing in pixels between successive commands
//     spotlightPadding: 2, // extra spacing in pixels between the element and the spotlight
//     minSpotlightRadius: 10, // the minimum radius in pixels of the spotlight
//     maxSpotlightRadius: 25, // the maximum radius in pixels of the spotlight
//     openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
//     itemColor: 'white', // the colour of text in the command's content
//     itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
//     zIndex: 9999, // the z-index of the ui div
//     atMouse: false // draw menu at mouse position
//   };

class CytoscapeGraph extends Component {
    constructor(props) {
    super(props);
    this.state = { cy: {} }
    }

    menu_defaults = {
        menuRadius: 50, // the radius of the circular menu in pixels
        selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
        commands: [ // an array of commands to list in the menu or a function that returns the array
          
          { // example command
            fillColor: 'rgba(61,65,78, 0.80)', // optional: custom background color for item
            content: "<img src='images/solution.png'  height='20px' width='20px' />", // html/text content to be displayed in the menu
            // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
            select: (ele)=>{ // a function to execute when the command is selected
                // console.log( ele.id() ) // `ele` holds the reference to the active element
                this.props.handleNodeClick(ele.id());
            },
            enabled: true // whether the command is selectable
          },
          { // show children
            fillColor: 'rgba(61,65,78, 0.80))', // optional: custom background color for item
            content: "<img src='images/network.png' height='20px' width='20px' />", // html/text content to be displayed in the menu
            // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
            select: (ele)=>{ // a function to execute when the command is selected
              //console.log( ele.id() ) // `ele` holds the reference to the active element
              if (ele.successors().targets()[0] !== undefined && ele.successors().targets()[0].style("display") == "none")
                ele.successors().targets().style("display", "element");
            },
            enabled: true // whether the command is selectable
          },
          { // hide node
            fillColor: 'rgba(61,65,78, 0.80))', // optional: custom background color for item
            content: "<img src='images/visibility.png'  height='20px' width='20px' />", // html/text content to be displayed in the menu
            // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
            select: (ele)=>{ // a function to execute when the command is selected
              console.log( ele.id() ); // `ele` holds the reference to the active element
              ele.successors().targets().style("display", "none");
            },
            enabled: true // whether the command is selectable
          },
          
        ], // function( ele ){ return [ /*...*/ ] }, // a function that returns commands or a promise of commands
        fillColor: 'rgba(61,65,78, 0.80)', // the background colour of the menu
        activeFillColor: 'rgba(0,153,153, 0.80)', // the colour used to indicate the selected command
        activePadding: 15, // additional size in pixels for the active command
        indicatorSize: 15, // the size in pixels of the pointer to the active command
        separatorWidth: 2, // the empty spacing in pixels between successive commands
        spotlightPadding: 2, // extra spacing in pixels between the element and the spotlight
        minSpotlightRadius: 10, // the minimum radius in pixels of the spotlight
        maxSpotlightRadius: 25, // the maximum radius in pixels of the spotlight
        openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
        itemColor: 'white', // the colour of text in the command's content
        itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
        zIndex: 9999, // the z-index of the ui div
        atMouse: false // draw menu at mouse position
      };

    componentDidMount() {
        this.updateGraph()
        // cy.json();
    }

    shouldComponentUpdate() {
        return false;
    }

    updateGraph(){
        conf.container = this.cyRef;
        conf.elements = this.props.data;
        const cy = cytoscape(conf);
        const menu = cy.cxtmenu(this.menu_defaults)
        cy.center()
        cy.on('tap', 'node', (evt)=>{
            var nodeId = evt.target.id();
            this.props.handleNodeClick(nodeId)
          });
        // cy.on('select', 'node', (evt)=>{
        //     evt.target.style({
        //         'background-color': selectedNodeColor
        //       });
        //   });
        // cy.on('unselect', 'node', (evt)=>{
        //     evt.target.style({
        //         'background-color': defaultNodeColor
        //       });
        //   });

        this.state = { cy };
    }

    hideChildren = (target)=>{
        console.log(target)
        target.successors().targets().style("display", "none");
       
        // else {
        //     //hide the children nodes and edges recursively
        //     target.successors().targets().style("display", "none");
        //     }
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.cy) {
            // this.state.cy.destroy();
        }
        if(nextProps.lastChanged !== this.props.lastChanged)
            this.updateGraph()
        // conf.container = this.cyRef;
        // conf.elements = nextProps.data;
        // const cy = cytoscape(conf);
        // const menu = cy.cxtmenu(menu_defaults)
        // cy.center()
        // cy.on('tap', 'node', function(evt){
        //     var node = evt.target;
        //     // console.log( 'tapped ' + node.id());
        //     this.props.handleNodeClick(node().id)
        //   });

        // this.state = { cy };
    }

    componentWillUnmount() {
        if (this.state.cy) {
            //this.state.cy.destroy();
        }
    }

    render() {
        
        return <div style={{height:this.props.height, display:'block'}} ref={(cyRef) => {
            this.cyRef = cyRef;
        }}/>
    }
}

export default CytoscapeGraph;