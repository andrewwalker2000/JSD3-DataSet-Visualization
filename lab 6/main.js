// **** Your JavaScript code goes here ****

// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    var category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of cereal
    updateChart(category);
}

// recall that when data is loaded into memory, numbers are loaded as strings
// this function helps convert numbers into string during data preprocessing
function dataPreprocessor(row) {
    return {
        year: row['Year'],
        car: +row['Car_Per_100K'],
        pedestrian: +row['Ped_Per_100K'],
        motorcycle: +row['Motorcycle_Per_100K'],
        bicycle: +row['Bicycle_Per_100K'],
        truck: +row['Trucks_Per_100K'],
        total: +row['Total_Per_100K']
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = { t: 60, r: 20, b: 80, l: 60 };

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Variable for the spacing of bar charts
var barBand;
var barWidth;

// scales

var sugarScale; // y axis
var xBandScale; // x axis

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', `translate(${padding.l}, ${padding.t})`);

var data;

d3.csv('TransportationFatalities_ByYear.csv', dataPreprocessor).then(function(dataset) {
        // Create global variables here and intialize the chart
        data = dataset;

        // Compute the spacing for bar bands based on number of cereals
        barBand = chartWidth / data.length;
        barWidth = 0.7 * barBand;

        // Add axes to chart
        addAxes();

        // Update the chart for All cereals to initialize
        updateChart('total');
});

// **** Functions to call for scaled values ****

function scaleDate(date) {
    return dateScale(date);
}

// **** Code for creating scales, axes and labels ****

var dateScale = d3.scaleTime()
    .domain([new Date(1975, 0, 1), new Date(2020, 0, 1)]).range([65,700]);

function addAxes() {
    // Add chart title

    var chartMiddle = chartWidth/2 + padding.l

    var title = svg.append('text')
        .attr('class', 'title')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${chartMiddle}, ${padding.t/2})`)
        .text('Transportation Fatalities By Year Per 100K');

    // **** Draw the axes here ****

    fatalitiesScale = d3.scaleLinear().domain([0,24]).range([chartHeight, 0]);

    var yAxis = svg.append('g').attr('class', 'y axis')
        .attr('transform', `translate(${padding.l}, ${padding.t})`)
        .text('Transportation Fatalities Per 100K')
        .call(d3.axisLeft(fatalitiesScale));

    var yLabel = svg.append('text')
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('transform','translate(15,200) rotate(90)')
        .text('Transportation Fatalities Per 100K');

    var xLabel = svg.append('text')
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${chartMiddle}, 370)`)
        .text('Year');

}

function barColor(year) {
    if (year == '1975') {
        return 'red';
    } else {
        return 'blue';
    }
}

function updateChart(selectedCategory) {

    // **** Draw and Update your chart here ****

    var dataForSelectedCategory = data.map(function(d) {
        return {
            year: d.year,
            value: d[selectedCategory]
        }
    });

    var categoryGroup = svg.selectAll('.fatalities')
        .data(dataForSelectedCategory)


    var startX = padding.l + 5;
    var startY = padding.t;
    var barMiddle = barWidth / 2;


    var cGroupEnter = categoryGroup.enter()
        .append('g')
        .attr('class', 'fatalities');

        cGroupEnter.merge(categoryGroup)
        .attr('transform', (d,i) =>
            `translate(${startX + i * barBand}, ${fatalitiesScale(d.value) + startY})`);

        cGroupEnter.append('rect')
        .attr('width', barWidth)
        .attr('height', d => chartHeight - fatalitiesScale(d.value))
        .attr('stroke', d => barColor(d.year))
        .attr('fill', d => barColor(d.year));

        cGroupEnter.append('text')
        .text(d => d.year)
        .attr('text-anchor', 'end')
        .attr('transform', d => `translate(${5 + barMiddle}, ${10 + chartHeight - fatalitiesScale(d.value)}) rotate(315)`);
    

}
