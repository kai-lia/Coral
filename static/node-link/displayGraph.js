const mainNode = graphData.main_node;
const nodeIndexes = graphData.nodes.index;
const nodeNames = graphData.nodes.name;
const nodeLats = graphData.nodes.lat;
const nodeLongs = graphData.nodes.lon;

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

// Function to update node colors and info box
function updateNodeInfo(pointIndex) {
    const nodeIndex = nodeIndexes[pointIndex];
    const nodeLat = nodeLats[pointIndex];
    const nodeLon = nodeLongs[pointIndex];
    const nodeName = nodeNames[pointIndex];
    const nodeStrata = nodeStratas[pointIndex];

    function haversine(lat1, lon1, lat2, lon2) {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 3958.8; // Radius of Earth in miles
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Filter resources within 7-mile radius
    let nearbyResources = infoData.filter(resource => {
        const resourceLat = parseFloat(resource.Latitude);
        const resourceLon = parseFloat(resource.Longitude);
        return haversine(nodeLat, nodeLon, resourceLat, resourceLon) <= 7;
    });

    // Generate resource info HTML
    let resourceHTML = "";
    nearbyResources.forEach(resource => {
        resourceHTML += `<strong>Type:</strong> ${resource.Type} <br>
                         <strong>Resources:</strong> <a href="${resource.Link}" target="_blank">${resource.Community}</a> <br>`;
    });

    // Update info box
    document.getElementById('info-text').innerHTML = `
        <strong>Index:</strong> ${nodeIndex} <br>
        <strong>Strata:</strong> ${nodeStrata} <br>
        <strong>Site Number:</strong> ${nodeName} <br>
        <strong>Latitude:</strong> ${nodeLat} <br>
        <strong>Longitude:</strong> ${nodeLon} <br>
        ${resourceHTML}
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

// Add click event listener to the graph
const graphDiv = document.getElementById('graph');
graphDiv.on('plotly_click', function(data) {
    const pointIndex = data.points[0].pointNumber;
    updateNodeInfo(pointIndex);
});