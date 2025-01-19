const maxWeight = Math.max(...graphData.edges.weights);
const slider = document.getElementById('weight-slider');
const sliderValue = document.getElementById('slider-value');

slider.max = maxWeight.toFixed(3);
slider.value = 0;
sliderValue.textContent = slider.value;

function filterGraph(weightThreshold) {
    const edgeX = graphData.edges.x;
    const edgeY = graphData.edges.y;
    const edgeWeights = graphData.edges.weights;
    const edgeNodes = graphData.edges.nodes;

    const filteredEdgesX = [];
    const filteredEdgesY = [];
    const filteredWeights = [];
    const filteredNodes = new Set();

    for (let i = 0; i < edgeWeights.length; i++) {
        if (edgeWeights[i] >= weightThreshold) {
            filteredEdgesX.push(edgeX[2 * i], edgeX[2 * i + 1], null);
            filteredEdgesY.push(edgeY[2 * i], edgeY[2 * i + 1], null);
            filteredWeights.push(edgeWeights[i]);

            filteredNodes.add(edgeNodes[2 * i]);
            filteredNodes.add(edgeNodes[2 * i + 1]);
        }
    }

    const updatedEdgeTrace = {
        x: filteredEdgesX,
        y: filteredEdgesY,
        mode: 'lines',
        line: { width: 2, color: graphData.edges.line_color },
        hoverinfo: 'none',
    };

    const updatedEdgeLabelTrace = {
        x: [],
        y: [],
        mode: 'text',
        text: filteredWeights.map(weight => `${weight.toFixed(3)}`),
        textposition: 'middle center',
        hoverinfo: 'none',
        showlegend: false,
    };

    for (let i = 0; i < filteredEdgesX.length; i += 3) {
        const x0 = filteredEdgesX[i];
        const x1 = filteredEdgesX[i + 1];
        const y0 = filteredEdgesY[i];
        const y1 = filteredEdgesY[i + 1];
        if (x1 !== null && y1 !== null) {
            updatedEdgeLabelTrace.x.push((x0 + x1) / 2);
            updatedEdgeLabelTrace.y.push((y0 + y1) / 2);
        }
    }

    const updatedNodeTrace = {
        x: [],
        y: [],
        mode: 'markers+text',
        marker: {
            color: [],
            size: 50,
            line: { width: 2 },
            opacity: 1,
        },
        text: [],
        textposition: 'middle center',
        hoverinfo: 'text',
    };

    graphData.nodes.index.forEach((nodeIndex, idx) => {
        if (filteredNodes.has(nodeIndex)) {
            updatedNodeTrace.x.push(graphData.nodes.x[idx]);
            updatedNodeTrace.y.push(graphData.nodes.y[idx]);
            updatedNodeTrace.marker.color.push(colors[idx]); // Use existing colors
            updatedNodeTrace.text.push(graphData.nodes.name[idx]);
        }
    });

    Plotly.react(
        'graph',
        [updatedEdgeTrace, updatedEdgeLabelTrace, updatedNodeTrace],
        layout,
        config
    );

    if (document.getElementById('highlight-strata').checked) {
        highlightByStrata();
    }
}

slider.addEventListener('input', () => {
    const weightThreshold = parseFloat(slider.value);
    console.log(`Current Weight Threshold: ${weightThreshold}`);
    sliderValue.textContent = weightThreshold.toFixed(2);
    filterGraph(weightThreshold);
});
