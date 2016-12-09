/**
 * Created by sungmin on 11/13/16.
 */

/*
 *  NAME - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- ???
 */

SuicideChart =  function(_parentElement, _data, _metaData) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    this.metaData = _metaData;

    this.initVis();
};



/*
 *  Initialize visualization (static content, e.g. SVG area or axes)
 */

SuicideChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 10, right: 10, bottom: 30, left: 20 };

    vis.width = 1000 - vis.margin.left - vis.margin.right,
        vis.height = 1000 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Filter data for Asians
    vis.displayData = vis.data.filter(function (person) {
        return person.RACEGRP == 5;
    });

    vis.wrangleData();
}


/*
 *  Data wrangling
 */

SuicideChart.prototype.wrangleData = function() {
    var vis = this;

    console.log(vis.displayData);

    vis.displayData_SuicideThink = vis.displayData.filter(function (person) {
        return person.MHSUITHK == 1;
    });
    vis.displayData_SuicidePlan = vis.displayData.filter(function (person) {
        return person.MHSUIPLN == 1;
    });
    vis.displayData_SuicideAttempt = vis.displayData.filter(function (person) {
        return person.MHSUITRY == 1;
    });

    console.log(vis.displayData_SuicideAttempt);
    // Sort data for mental illness - yes mental illness to no mental illness
    vis.displayData_SuicideThink.sort(function (a,b) { return b.MHSUIPLN - a.MHSUIPLN });

    // Sort data for mental illness - yes mental illness to no mental illness
    //vis.displayData_SuicideThink.sort(function (a,b) { return b.MHSUITRY - a.MHSUITRY });

    // Currently no data wrangling/filtering needed
    // vis.displayData = vis.data;

    // Update the visualization
    vis.updateVis();

}


/*
 *  The drawing function
 */

SuicideChart.prototype.updateVis = function() {
    var vis = this;

    console.log(vis.displayData_SuicideThink);
    console.log(vis.displayData_SuicidePlan);
    console.log(vis.displayData_SuicideAttempt);

    // Add circles to chart
    vis.cells = vis.svg.selectAll(".suicideCells")
        .data(vis.displayData_SuicideThink);

    vis.circlesPerRow = 7;
    vis.radius = 20;
    var counter = 1;

   vis.cells.enter().append("rect")
        .attr("class", "suicideCells")
        .attr("x", function (d, index) { return (index%vis.circlesPerRow)*2*vis.radius + vis.radius; })
        .attr("y", function (d, index) { return Math.floor(index/vis.circlesPerRow)*2*vis.radius + vis.radius; })
        .attr("width", 20)
        .attr("height",20)
        .attr("fill", "red")
        .attr("opacity", 0.3)
       .on("mouseover", function(){
           d3.select(this)
               .attr("width",100)
               .attr("height",100)
               .attr("opacity",1)
               .style("fill", function(d){
                       console.log("url(#"+d.IMG+")");
                       return "url(#"+d.IMG+")";
               });
       })
       .on("mouseout", function(){
           d3.select(this)
               .attr("width",20)
               .attr("height",20)
               .attr("opacity",0.3)
               .style("fill", "red");
       });

    // Add circles to chart
    vis.cells2 = vis.svg.selectAll(".suicideCells2")
        .data(vis.displayData_SuicidePlan);

    vis.cells2.enter().append("rect")
        .attr("class", "suicideCells2")
        .attr("x", function (d, index) { return 300+(index%vis.circlesPerRow)*2*vis.radius + vis.radius; })
        .attr("y", function (d, index) { return Math.floor(index/vis.circlesPerRow)*2*vis.radius + vis.radius; })
        .attr("width", 20)
        .attr("height",20)
        .attr("fill", "red")
        .attr("opacity", 0.5);


    // Add circles to chart
    vis.cells3 = vis.svg.selectAll(".suicideCells3")
        .data(vis.displayData_SuicideAttempt);

    vis.cells3.enter().append("rect")
        .attr("class", "suicideCells3")
        .attr("x", function (d, index) { return 600+(index%vis.circlesPerRow)*2*vis.radius + vis.radius; })
        .attr("y", function (d, index) { return Math.floor(index/vis.circlesPerRow)*2*vis.radius + vis.radius; })
        .attr("width", 20)
        .attr("height",20)
        .attr("fill", "red")
        .attr("opacity", 0.9);


    /*
    //Compute Prevalence for Depression
    vis.suicidePlanData = d3.nest()
        .key(function(d){return d.MHSUIPLN;})
        .rollup(function(leaves) { return leaves.length; })
        .entries(vis.displayData);

    console.log(vis.suicidePlanData);

    var suicidePlanPrev = Math.round((vis.suicidePlanData[1].values / vis.displayData.length)*100);
    console.log(suicidePlanPrev);
    */

    /*

    //Compute Prevalence for Suicide Attempt
    vis.suicideAttemptData = d3.nest()
        .key(function(d){return d.MHSUITRY;})
        .rollup(function(leaves) { return leaves.length; })
        .entries(vis.displayData);

    console.log(vis.suicideAttemptData);

    var suicideAttemptCount = vis.suicideAttemptData[1].values;
    console.log(suicideAttemptCount);



    var x_labelPadding = 80;
    var y_labelPadding = 10;

    var label = vis.svg.selectAll(".bartext")
        .data(shelter_data);

    label.enter().append("text")
        .attr("class","bartext")
        .attr("text-anchor","middle")
        .attr("fill","black")
        .attr("x", function(d,index){
            return shelterScale(d.shelter_type)+ x_labelPadding;
        })

    label
        .transition()
        .duration(400)
        .attr("y",function(d){
            return (percentScale(d.percentage)- y_labelPadding);
        })
        .text(function(d) {
            return (d.percentage);
        });

    label.exit().remove();
    */

}

SuicideChart.prototype.onSelectionChange = function(button){
    var vis = this;

    if (button == 1) {
        vis.cells
            .transition()
            .duration(2000)
            .attr("y", function (d, index) { return Math.floor(index/vis.circlesPerRow)*2*vis.radius + 26*vis.radius; });
        vis.cells2
            .transition()
            .duration(3000)
            .attr("opacity",0.5)
            .attr("y", function (d, index) {
                if(d.MHSUITHK == 1){
                    return Math.floor(index/vis.circlesPerRow)*2*vis.radius + 26*vis.radius; }
                else{
                    return Math.floor(index/vis.circlesPerRow)*2*vis.radius + vis.radius; }
            });
        vis.cells3
            .transition()
            .duration(4000)
            .attr("y", function (d, index) {
                if (d.MHSUITHK == 1) {
                    return Math.floor(index / vis.circlesPerRow) * 2 * vis.radius + 26 * vis.radius;
                }
                else {
                    return Math.floor(index / vis.circlesPerRow) * 2 * vis.radius + vis.radius;
                }
            });
    }
    else if (button == 2)
    {
        vis.cells2
            .transition()
            .duration(2000)
            .attr("y", function (d, index) { return Math.floor(index/vis.circlesPerRow)*2*vis.radius + 13*vis.radius; });

        vis.cells3
            .transition()
            .duration(3000)
            .attr("y",function(d,index){
                if(d.MHSUIPLN == 1){
                    return Math.floor(index / vis.circlesPerRow) * 2 * vis.radius + 13 * vis.radius;
                }
                else
                    return Math.floor(index / vis.circlesPerRow) * 2 * vis.radius + vis.radius;
            });
    }
    else if (button == 3)
        vis.cells3
            .transition()
            .duration(2000)
            .attr("y",function(d,index){
                return Math.floor(index / vis.circlesPerRow) * 2 * vis.radius + 13 * vis.radius;
            });
}

SuicideChart.prototype.reset = function(){
    var vis = this;

    vis.cells
        .transition()
        //.duration(2000)
        .attr("y", function (d, index) { return Math.floor(index/vis.circlesPerRow)*2*vis.radius + vis.radius; });
    vis.cells2
        .transition()
        //.duration(3000)
        .attr("y", function (d, index) {
                return Math.floor(index/vis.circlesPerRow)*2*vis.radius + vis.radius; });
    vis.cells3
        .transition()
        //.duration(4000)
        .attr("y", function (d, index) {
            return Math.floor(index/vis.circlesPerRow)*2*vis.radius + vis.radius; });

    vis.updateVis();
}




