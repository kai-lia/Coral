const mainNode = graphData.main_node;
const nodeIndexes = graphData.nodes.index;
const nodeNames = graphData.nodes.name;
const nodeLats = graphData.nodes.lat;
const nodeLongs = graphData.nodes.lon;
const nodeStratas = graphData.nodes.strata;

const strataColors = {
    1: '#4E79A7',
    2: '#A0CBE8',
    3: '#F28E2B',
    4: '#FFBE7D',
    5: '#59A14F',
    6: '#8CD17D',
    7: '#B6992D',
    8: '#F1CE63',
    9: '#499894',
    10: '#86BCB6',
    11: '#E15759',
    12: '#FF9D9A',
    13: '#79706E',
    14: '#BAB0AC',
    15: '#D37295',
    16: '#FABFD2',
    17: '#B07AA1',
    18: '#D4A6C8',
    19: '#9D7660',
    20: '#D7B5A6',
};

const strataColorsSelected = {
    1: '#305986',
    2: '#749EBA',
    3: '#C26203',
    4: '#CC8E4F',
    5: '#3C8132',
    6: '#65A757',
    7: '#92760E',
    8: '#C19F38',
    9: '#2E7A76',
    10: '#639691',
    11: '#B43031',
    12: '#CC6E6B',
    13: '#615856',
    14: '#958B87',
    15: '#A94C6D',
    16: '#C88FA2',
    17: '#8D597E',
    18: '#AA7D9E',
    19: '#7E5843',
    20: '#AC8B7D',
};

// Identify the index of the main node
let mainNodeIndex = nodeIndexes.findIndex(index => index === mainNode);

// Initialize default colors
let colors = nodeIndexes.map((_, idx) => idx === mainNodeIndex ? '#f4737a' : 'skyblue');

const edge_trace = {
    x: graphData.edges.x,
    y: graphData.edges.y,
    mode: 'lines',
    line: { width: 2, color: graphData.edges.line_color },
    hoverinfo: 'none',
};

const edge_label_trace = {
    x: [],
    y: [],
    mode: 'text',
    text: graphData.edges.weights.map(weight => `${weight.toFixed(3)}`),
    textposition: 'middle center',
    hoverinfo: 'none',
    showlegend: false,
};

for (let i = 0; i < graphData.edges.x.length; i += 2) {
    if (graphData.edges.x[i + 1] !== null && graphData.edges.y[i + 1] !== null) {
        const x0 = graphData.edges.x[i];
        const x1 = graphData.edges.x[i + 1];
        const y0 = graphData.edges.y[i];
        const y1 = graphData.edges.y[i + 1];
        
        edge_label_trace.x.push((x0 + x1) / 2);
        edge_label_trace.y.push((y0 + y1) / 2);
    }
}

// Node trace
let node_trace = {
    x: graphData.nodes.x,
    y: graphData.nodes.y,
    mode: 'markers+text',
    marker: {
        color: colors,
        size: 50,
        line: { width: 2 },
        opacity: 1,
    },
    text: graphData.nodes.name,
    textposition: 'middle center',
    hoverinfo: 'text',
};

// Plotly layout
const layout = {
    title: 'Reef Network Graph',
    showlegend: false,
    hovermode: 'closest',
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    xaxis: { visible: false },
    yaxis: { visible: false },
    margin: { l: 50, r: 50, t: 50, b: 50 },
};

const config = { responsive: true };

// Plot the initial graph
Plotly.newPlot('graph', [edge_trace, edge_label_trace, node_trace], layout, config);
Plotly.newPlot('graph', [edge_trace, edge_label_trace, node_trace], layout, config);

// Function to update node colors and info box
function updateNodeInfo(pointIndex) {
    const nodeIndex = nodeIndexes[pointIndex];
    const nodeLat = nodeLats[pointIndex];
    const nodeLon = nodeLongs[pointIndex];
    const nodeName = nodeNames[pointIndex];
    const nodeStrata = nodeStratas[pointIndex];

    // Update info box
    document.getElementById('info-text').innerHTML = `
        <strong>Index:</strong> ${nodeIndex} <br>
        <strong>Name:</strong> ${nodeName} <br>
        <strong>Latitude:</strong> ${nodeLat} <br>
        <strong>Longitude:</strong> ${nodeLon} <br>
        <strong>Strata:</strong> ${nodeStrata}
    `;

    // If the checkbox is checked, highlight by strata
    if (document.getElementById('highlight-strata').checked) {
        highlightByStrata(pointIndex);
    } else {
        // Update colors: highlight the selected node
        //used classic blue-red 12 sceheme
        colors = nodeIndexes.map((_, idx) => {
            if (idx === pointIndex) {
                return idx === mainNodeIndex ? '#bd0a36' : '#2c69b0';
            }
            return idx === mainNodeIndex ? '#f4737a' : 'skyblue';
        });
        Plotly.restyle('graph', 'marker.color', [colors]);
    }
}

// Function to highlight nodes by strata
function highlightByStrata(pointIndex) {
    colors = nodeStratas.map((strata, idx) => {
        if (idx === pointIndex) {
            return strataColorsSelected[strata];
    } else {
        return  strataColors[strata];
    }

    });
    Plotly.restyle('graph', 'marker.color', [colors]);
}

// Add event listener for the checkbox
document.getElementById('highlight-strata').addEventListener('change', () => {
    if (document.getElementById('highlight-strata').checked) {
        highlightByStrata();
    } else {
        // Reset colors to default
        colors = nodeIndexes.map((_, idx) => idx === mainNodeIndex ? '#f4737a' : 'skyblue');
        Plotly.restyle('graph', 'marker.color', [colors]);
    }
});

// Add click event listener to the graph
const graphDiv = document.getElementById('graph');
graphDiv.on('plotly_click', function(data) {
    const pointIndex = data.points[0].pointNumber;
    updateNodeInfo(pointIndex);
});
