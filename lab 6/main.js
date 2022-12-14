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

var padding = { t: 60, r: 300, b: 80, l: 60 };

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
        .text('Comparing Types of Transportation Fatalities By Year (Per 100K)');

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

    var xAxis = svg.append('g').attr('class', 'x axis')
        .attr('transform', `translate(${padding.l - 60}, ${chartHeight + padding.t})`)
        .text(function(d) {
             return data.year;})
        .attr('text-anchor', 'middle')
        .call(d3.axisBottom(dateScale).tickFormat(d3.timeFormat('%Y')));

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
        // Update the transform attribute for the g elements
        .attr('transform', (d,i) =>
            `translate(${startX + i * barBand}, ${fatalitiesScale(d.value) + startY})`)
        //Update the width and height attributes of the rect elements
        .select('rect')
        .attr('width', barWidth)
        .attr('height', d => chartHeight - fatalitiesScale(d.value))
        // Update the transform attribute for the text elements
        .select('text')
        .text(d => d.year)
        .attr('text-anchor', 'end')
        // Apply the fatalitiesScale function to the text elements
        .attr('transform', (d,i) => `translate(${startX + i * barBand}, ${fatalitiesScale(d.value) + startY})`);

        cGroupEnter.append('rect')
        .attr('width', barWidth)
        .attr('height', d => chartHeight - fatalitiesScale(d.value))
        // Function to change the color of the bar depending on the year range
        .attr('fill', function(d) {
            if ((d.year) >= '1975' && (d.year) < '1980') {
                return d3.color('#003f5c');
            } else if ((d.year) >= '1980' && (d.year) < '1985') {
                return d3.color('#2f4b7c');
            } else if ((d.year) >= '1985' && (d.year) < '1990') {
                return d3.color('#665191');
            } else if ((d.year) >= '1990' && (d.year) < '1995') {
                return d3.color('#a05195');
            } else if ((d.year) >= '1995' && (d.year) < '2000') {
                return d3.color('#d45087');
            } else if ((d.year) >= '2000' && (d.year) < '2005') {
                return d3.color('#f95d6a');
            } else if ((d.year) >= '2005' && (d.year) < '2010') {
                return d3.color('#ff7c43');
            } else if ((d.year) >= '2010' && (d.year) < '2015') {
                return d3.color('#ffa600');
            } else if ((d.year) >= '2015' && (d.year) <= '2020') {
                return d3.color('#f9c879');
            }
        })

        // Hover text to show the Year
        cGroupEnter.append('text').text(d => 'Year: ' + d.year)
            .attr('class', 'barText')
            .attr('text-anchor', 'left')
            .attr('transform', 'translate(0, -40)');

        // Hover text to show the Fatalities
        cGroupEnter.append('text').text(d => 'Fatalities: ' + d.value)
            .attr('class', 'barText')
            .attr('text-anchor', 'left')
            .attr('transform', 'translate(0, -30)');

        // Title for the Legend
        var legendGroup = svg.append('text').text('Legend:')
            .attr('class', 'legend')
            .attr('x', '825')
            .attr('y', '100');

        // Group for each of the year ranges in the legend
        var firstGroup = svg.append('g');

        firstGroup.append('rect')
            .attr('x', '800')
            .attr('y', '120')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#003f5c');

        firstGroup.append('text')
            .attr('class', 'legendText')
            .attr('x', '820')
            .attr('y', '130')
            .text('1975 - 1979');

        var secondGroup = svg.append('g');

        secondGroup.append('rect')
            .attr('x', '800')
            .attr('y', '140')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#2f4b7c');

        secondGroup.append('text')
            .attr('class', 'legendText')
            .attr('x', '820')
            .attr('y', '149')
            .text('1980 - 1984');

        var thirdGroup = svg.append('g');

        thirdGroup.append('rect')
            .attr('x', '800')
            .attr('y', '160')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#665191');

        thirdGroup.append('text')
            .attr('class', 'legendText')
            .attr('x', '820')
            .attr('y', '169')
            .text('1985 - 1989');


        var fourthGroup = svg.append('g');

        fourthGroup.append('rect')
            .attr('x', '800')
            .attr('y', '160')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#665191');

        thirdGroup.append('text')
            .attr('class', 'legendText')
            .attr('x', '820')
            .attr('y', '169')
            .text('1985 - 1989');


        var fourthGroup = svg.append('g');

        fourthGroup.append('rect')
            .attr('x', '800')
            .attr('y', '180')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#a05195');

        fourthGroup.append('text')
            .attr('class', 'legendText')
            .attr('x', '820')
            .attr('y', '189')
            .text('1990 - 1994');

        var fifthGroup = svg.append('g');

        fifthGroup.append('rect')
            .attr('x', '800')
            .attr('y', '200')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#d45087');

        fifthGroup.append('text')
            .attr('class', 'legendText')
            .attr('x', '820')
            .attr('y', '209')
            .text('1995 - 1999');

        var sixthGroup = svg.append('g');

        sixthGroup.append('rect')
            .attr('x', '800')
            .attr('y', '220')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#f95d6a');

        sixthGroup.append('text')
            .attr('class', 'legendText')
            .attr('x', '820')
            .attr('y', '229')
            .text('2000 - 2004');

        var seventhGroup = svg.append('g');

        seventhGroup.append('rect')
            .attr('x', '800')
            .attr('y', '240')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#ff7c43');

        seventhGroup.append('text')
            .attr('class', 'legendText')
            .attr('x', '820')
            .attr('y', '249')
            .text('2005 - 2009');

        var eighthGroup = svg.append('g');

        eighthGroup.append('rect')
            .attr('x', '800')
            .attr('y', '260')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#ffa600');

        eighthGroup.append('text')
            .attr('class', 'legendText')
            .attr('x', '820')
            .attr('y', '269')
            .text('2010 - 2014');

        var lastGroup = svg.append('g');

        lastGroup.append('rect')
            .attr('x', '800')
            .attr('y', '280')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', '#f9c879');

        lastGroup.append('text')
            .attr('class', 'legendText')
            .attr('x', '820')
            .attr('y', '289')
            .text('2015 - 2020');

}
