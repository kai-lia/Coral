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