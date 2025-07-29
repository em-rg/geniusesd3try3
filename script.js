// Sephirot data structure based on Giorgia Lupi's visualization
const sephirotStructure = [
    { name: "Keter (crown)", x: 0.5, y: 0.14, color: "#d4c48f" },
    { name: "Hokhmah (wisdom)", x: 0.29, y: 0.19, color: "#d4c48f" },
    { name: "Binah (understanding)", x: 0.71, y: 0.19, color: "#d4c48f" },
    { name: "Hesed (kindness)", x: 0.68, y: 0.30, color: "#d4c48f" },
    { name: "Din (severity)", x: 0.32, y: 0.30, color: "#d4c48f" },
    { name: "Tiferet (beauty)", x: 0.5, y: 0.43, color: "#d4c48f" },
    { name: "Netzah (eternity)", x: 0.68, y: 0.52, color: "#d4c48f" },
    { name: "Hod (splendor)", x: 0.32, y: 0.52, color: "#d4c48f" },
    { name: "Yesod (foundation)", x: 0.5, y: 0.62, color: "#d4c48f" },
    { name: "Malkut (kingdom)", x: 0.5, y: 0.74, color: "#d4c48f" }
];

// Field colors match the Giorgia Lupi's color palette
const fieldColors = {
    "Philosophy": "#b5dbb9",   // Soft mint green
    "Literature": "#a4d7d0",   // Soft teal
    "Theology": "#e8daae",     // Soft sand/mustard
    "Poetry": "#d9e8b8",       // Soft yellow-green
    "Theater": "#f3c7bf",      // Soft coral
    "Fiction": "#e6c0dc",      // Soft lavender
};

// Arc placement around Sephirot nodes
const arcRadius = 80; // Increased for better visibility
const getArcPositions = (sephirotIndex, count) => {
    const center = sephirotStructure[sephirotIndex];
    const positions = [];
    
    for (let i = 0; i < count; i++) {
        // Calculate position on an arc around the Sephirot
        const angle = (i / count) * Math.PI + (Math.PI / 2);
        const x = center.x + Math.cos(angle) * (arcRadius / 800);
        const y = center.y + Math.sin(angle) * (arcRadius / 800);
        positions.push({ x, y });
    }
    
    return positions;
};

// Create SVG and set up legend
function setupVisualization() {
    // Create the main SVG container
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const containerWidth = document.querySelector('.main-content').offsetWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = Math.min(window.innerHeight * 0.75, 900); // Responsive height
    
    const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Add scales for positioning
    const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width - margin.left - margin.right]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, height - margin.top - margin.bottom]);
    
    // Draw connecting lines between Sephirot
    const sephirotConnections = [
        [0, 1], [0, 2], [1, 3], [1, 5], [2, 4], [2, 5], 
        [3, 5], [3, 6], [4, 5], [4, 7], [5, 6], [5, 7], 
        [5, 8], [6, 8], [7, 8], [8, 9]
    ];
    
    // Draw paths connecting the Sephirot
    sephirotConnections.forEach(connection => {
        const start = sephirotStructure[connection[0]];
        const end = sephirotStructure[connection[1]];
        
        svg.append('line')
            .attr('x1', xScale(start.x))
            .attr('y1', yScale(start.y))
            .attr('x2', xScale(end.x))
            .attr('y2', yScale(end.y))
            .attr('stroke', '#d4c48f')
            .attr('stroke-width', 1)
            .attr('opacity', 0.7);
    });
    
    // Draw the Sephirot nodes
    svg.selectAll('.sephirot-node')
        .data(sephirotStructure)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 12) // Larger Sephirot nodes
        .attr('fill', d => d.color)
        .attr('stroke', '#5c4738')
        .attr('stroke-width', 1);
    
    // Add Sephirot labels
    svg.selectAll('.sephirot-label')
        .data(sephirotStructure)
        .enter()
        .append('text')
        .attr('x', d => xScale(d.x))
        .attr('y', d => yScale(d.y) + 32) // Below the node
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#5c4738')
        .text(d => d.name.split(' ')[0]); // Just the first part of the name
        
    // Create legend
    const legend = d3.select('.legend-content');
    
    // Field colors for the legend
    const legendContent = legend.append('div')
        .attr('class', 'legend-fields');
    
    legendContent.append('h3')
        .text('Field of contribution');
    
    Object.entries(fieldColors).forEach(([field, color]) => {
        const legendItem = legendContent.append('div')
            .attr('class', 'legend-item');
        
        legendItem.append('div')
            .attr('class', 'legend-color')
            .style('background-color', color);
        
        legendItem.append('div')
            .attr('class', 'legend-label')
            .text(field);
    });
    
    // Node size legend
    const nodeSizeLegend = legend.append('div')
        .attr('class', 'legend-node-size');
    
    nodeSizeLegend.append('h3')
        .text('Node size');
    
    nodeSizeLegend.append('p')
        .text('Represents Wikipedia page views (relative popularity)');
    
    // Year legend
    const yearLegend = legend.append('div')
        .attr('class', 'legend-year');
    
    yearLegend.append('h3')
        .text('Position within arc');
    
    yearLegend.append('p')
        .text('Arranged chronologically by time period');
    
    return {
        svg,
        xScale,
        yScale,
        width,
        height
    };
}

function loadDataAndCreateVisualization() {
    // Try multiple paths for loading the dataset with better error handling
    // In GitHub Pages, prioritize loading from the root directory
    const pathsToTry = [
        "geniuses_dataset_updated.csv", // Try root first, which is what GitHub Pages will use
        "geniuses_dataset.csv"          // Fallback to original dataset in root
    ];
    
    // Function to try loading the next path
    function tryLoadingPath(index) {
        if (index >= pathsToTry.length) {
            console.error("Failed to load dataset from all locations");
            return;
        }
        
        const path = pathsToTry[index];
        console.log(`Trying to load dataset from: ${path}`);
        
        d3.csv(path).then(data => {
            console.log(`Successfully loaded dataset from: ${path}`);
            
            // Apply field colors based on contribution field
            data.forEach(d => {
                d['Field Color'] = fieldColors[d['Field of Contribution']] || "#c7e1bc";
            });
            createVisualization(data);
        }).catch(error => {
            console.error(`Error loading the dataset from ${path}:`, error);
            tryLoadingPath(index + 1);
        });
    }
    
    // Start trying to load from the first path
    tryLoadingPath(0);
}

function createVisualization(data) {
    const { svg, xScale, yScale, width, height } = setupVisualization();
    
    // Group geniuses by their assigned Sephirot
    const geniusesBySephirot = {};
    sephirotStructure.forEach((s, i) => {
        geniusesBySephirot[i] = data.filter(d => d['Sephirot Number'] == i);
    });
    
    // Create a div to hold name lists
    const nameLists = d3.select('.name-lists');
    
    // Create genius nodes for each Sephirot
    Object.entries(geniusesBySephirot).forEach(([sephirotIndex, geniuses]) => {
        // Sort geniuses by date
        geniuses.sort((a, b) => +a['Year'] - +b['Year']);
        
        // Calculate node positions around Sephirot
        const positions = getArcPositions(+sephirotIndex, geniuses.length);
        
        // Create genius nodes
        geniuses.forEach((genius, i) => {
            const pos = positions[i];
            const sizeScale = d3.scaleLinear()
                .domain([1000, 100000])
                .range([5, 12])
                .clamp(true);
            
            const size = sizeScale(+genius['Wikipedia Views']);
            
            // Draw the node
            const node = svg.append('circle')
                .attr('cx', xScale(pos.x))
                .attr('cy', yScale(pos.y))
                .attr('r', size)
                .attr('fill', genius['Field Color'])
                .attr('stroke', '#5c4738')
                .attr('stroke-width', 0.5)
                .attr('class', 'genius-node')
                .attr('data-name', genius['Name']);
            
            // Add tooltip interaction
            node.on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', 2);
                
                const tooltip = d3.select('body').append('div')
                    .attr('class', 'tooltip')
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
                    .style('opacity', 0);
                
                tooltip.html(`
                    <strong>${genius['Name']}</strong><br>
                    ${genius['Field of Contribution']}<br>
                    ${genius['Year']}<br>
                    Lustre Level: ${genius['Lustre Level']}<br>
                    Wikipedia Views: ${(+genius['Wikipedia Views']).toLocaleString()}
                `)
                .transition()
                .duration(200)
                .style('opacity', 1);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('stroke-width', 0.5);
                
                d3.select('.tooltip')
                    .transition()
                    .duration(500)
                    .style('opacity', 0)
                    .remove();
            });
            
            // Add lustre level indicator
            if (genius['Lustre Level'] && genius['Lustre Level'] !== '0') {
                svg.append('text')
                    .attr('x', xScale(pos.x))
                    .attr('y', yScale(pos.y) + 3)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '9px')
                    .attr('fill', '#5c4738')
                    .attr('pointer-events', 'none')
                    .text(genius['Lustre Level']);
            }
        });
        
        // Add names to the side lists
        const sephirot = sephirotStructure[+sephirotIndex];
        const nameList = nameLists.append('div')
            .attr('class', 'name-list');
        
        nameList.append('h3')
            .text(sephirot.name.split(' ')[0]);
        
        const nameItems = nameList.append('ul');
        
        geniuses.forEach(genius => {
            nameItems.append('li')
                .attr('data-name', genius['Name'])
                .html(`<span class="name">${genius['Name']}</span> <span class="year">${genius['Year']}</span>`)
                .style('font-size', '16px'); // Larger font size for name list
        });
    });
}

// Initialize visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', loadDataAndCreateVisualization);
