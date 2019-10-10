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

let  defaultNodeColor = "#F48D49";
let  selectedNodeColor = "#F2711C";
let  nodeHighlightColor = "#F2711C";
let conf = {
    // boxSelectionEnabled: true,
    // autounselectify: true,
    zoomingEnabled: true,
    minZoom: 0.5,
    maxZoom: 5,
    wheelSensitivity: 0.5,
    style: [
        {
            selector: 'core',
            style: {
                'active-bg-size': 0
            }
        },
        {
            selector: 'node',
            style: {
                'content': 'data(label)',
                'text-opacity': 1,
                'text-valign': 'center',
                'text-halign': 'center',
                'color': 'white',
                'font-size': 11,
                'background-color': defaultNodeColor,
                "selection-box-opacity": 0,
                "height":50,
                "width": 50,
                "border-style":"solid",
                "border-color":"#dc681a",
                "border-width":2,  

            }
        },
        {
            selector: ':active',
            style: {
                // 'background-color': selectedNodeColor,
                'overlay-color': selectedNodeColor,
                'overlay-padding': 5,
                'overlay-opacity': 0.2,
            }
        },
       
        {
            selector: 'node.highlight',
            style: {
                // 'border-color': nodeHighlightColor,
                // 'border-width': '20px',
                // "border-opacity": "0.3",
                "outline-style": "solid",
                "outline-width": 10,
                "outline-color":"red",
                "outline-offset": "15px",
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
                "text-border-style": "solid",
                "text-border-style": "3px",
                "text-border-color": "white",
                "text-border-opacity": 0.9,
                'label': 'data(label)',
                'text-background-color' :'white',
                'text-background-opacity': 0.9,
            }
        }
    ],
    layout: {
        name: 'dagre',
        fit: false,
    }
};


class CytoscapeGraph extends Component {
    constructor(props) {
    super(props);
    this.state = { cy: {} }
    }

    menu_defaults = {
        menuRadius: 70, // the radius of the circular menu in pixels
        selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
        commands: [ // an array of commands to list in the menu or a function that returns the array
          
          { // example command
            // fillColor: 'rgba(61,65,78, 0.80)', // optional: custom background color for item
            content: "<img src='images/solution.png'  height='22px' width='22px' />", // html/text content to be displayed in the menu
            // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
            select: (ele)=>{ // a function to execute when the command is selected
                // console.log( ele.id() ) // `ele` holds the reference to the active element
                this.props.handleNodeClick(ele.id());
            },
            enabled: true // whether the command is selectable
          },
          { // show children
            // fillColor: 'rgba(61,65,78, 0.80))', // optional: custom background color for item
            content: "<img src='images/network.png' height='22px' width='22px' />", // html/text content to be displayed in the menu
            // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
            select: (ele)=>{ // a function to execute when the command is selected
                              //console.log( ele.id() ) // `ele` holds the reference to the active element
              var hiddenOutgoers = ele.outgoers().targets().filter((x)=>x.style("display") == "none")

              if (hiddenOutgoers.length > 0)
                ele.outgoers().targets().style("display", "element");
              else
                ele.successors().targets().style("display", "none");
              
            },
            enabled: true // whether the command is selectable
          },
          { // hide node and successors
            // fillColor: 'rgba(61,65,78, 0.80))', // optional: custom background color for item
            content: "<img src='images/visibility.png'  height='22px' width='22px' />", // html/text content to be displayed in the menu
            // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
            select: (ele)=>{ // a function to execute when the command is selected
                if (ele.id()!=="0") {
                    ele.successors().targets().style("display", "none");
                    ele.style("display", "none");
                }
              
            },
            enabled: true
          },
          { // close menu
            // fillColor: 'rgba(61,65,78, 0.80))', // optional: custom background color for item
            content: "<img src='images/cancel.png' height='22px' width='22px' />", // html/text content to be displayed in the menu
            // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
            select: (ele)=>{ // a function to execute when the command is selected
                // do nothing
            },
            enabled: true // whether the command is selectable
          },
          
        ], // function( ele ){ return [ /*...*/ ] }, // a function that returns commands or a promise of commands
        fillColor: 'rgba(189,192,193, 0.80)', // the background colour of the menu
        activeFillColor: 'rgba(0,153,153, 0.80)', // the colour used to indicate the selected command
        activePadding: 5, // additional size in pixels for the active command
        indicatorSize: 0, // the size in pixels of the pointer to the active command
        separatorWidth: 2, // the empty spacing in pixels between successive commands
        spotlightPadding: 10, // extra spacing in pixels between the element and the spotlight
        minSpotlightRadius: 20, // the minimum radius in pixels of the spotlight
        maxSpotlightRadius: 20, // the maximum radius in pixels of the spotlight
        openMenuEvents: 'tap', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
        
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
        cy.on('click', 'node', (evt)=>{
            // var nodeId = evt.target.id();
            // this.props.handleNodeClick(nodeId)
        });
        cy.on('mouseover', 'node', (e)=>{
            var sel = e.target;
            //cy.elements().difference(sel.outgoers()).not(sel).addClass('semitransp');
            sel.addClass('highlight'); //.outgoers().addClass('highlight');
        });
        cy.on('mouseout', 'node', (e)=>{
            var sel = e.target;
            //cy.elements().removeClass('semitransp');
            sel.removeClass('highlight'); //.outgoers().removeClass('highlight');
        });

        this.state = { cy };
    }

    hideChildren = (target)=>{
        console.log(target)
        target.successors().targets().style("display", "none");
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.cy) {
            // this.state.cy.destroy();
        }
        if(nextProps.lastChanged !== this.props.lastChanged)
            this.updateGraph();
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