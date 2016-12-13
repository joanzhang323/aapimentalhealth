/**
 * Created by sungmin on 12/05/16.
 */

/*
 *  RacialComparison - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- data
 */

RacialComparison = function(_parentElement, _data, _meta) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.meta = _meta;
    this.filteredData = _data;
    this.mhSelection = ["AMIYR_U"];

    this.initVis();
}


/*
 * -------------------------------------------------------------------------------------------------------------------
 *  Initialize visualization
 * -------------------------------------------------------------------------------------------------------------------
 */

RacialComparison.prototype.initVis = function() {
    var vis = this;
    //console.log("initvis");
    vis.margin = { top: 20, right: 10, bottom: 20, left: 10 };

    vis.width = $("#" + vis.parentElement).width()  - vis.margin.left - vis.margin.right,
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Set radius
    vis.radius = 5;

    // Append legend
    var legendCode = [
        ["green", "Has mental health"],
        ["red", "Depression"],
        ["blue", "Suicide"],
        ["purple", "Substance Abuse"]
    ];

    var legend = vis.svg.selectAll(".legend")
        .data(legendCode);

    legend.exit().remove();

    var legendEnter = legend.enter().append("g")
        .attr("class", "legendRow");

    legend
        .attr("transform", function (d, index) {
            return "translate(0," + (vis.height/3 + index*20) + ")";
        });

    var legendCircle = legendEnter.append("circle")
        .attr("cx", vis.radius + 2)
        .attr("r", vis.radius + 2)
        .attr("fill", function (d) { return d[0]; });

    var legendText = legendEnter.append("text")
        .attr("class", "legendText")
        .attr("x", (vis.radius + 2)*2 + vis.radius)
        .attr("y", vis.radius - 2)
        .text(function (d) { return (" = " + d[1]); });


    vis.wrangleData();
}



/*
 * -------------------------------------------------------------------------------------------------------------------
 * Data Wrangling
 * -------------------------------------------------------------------------------------------------------------------
 */

RacialComparison.prototype.wrangleData = function() {
    var vis = this;
    var indexHeight = 2;
    //console.log("wrangle");

    // Initialize and empty arrayStorage;
    var arrayStorage = [];
    for (var i = 0; i < 7; i++) { arrayStorage.pop(); }
    //console.log(vis.displayData);


    /*
     * Find the percent of people with mental health issues for each race within the filtered population
     */
    var color = {
        AMIYR_U : 1,
        AMDEYR : 2,
        MHSUITHK : 3,
        ABODILAL : 4
    };

    // Helper function to produce an array of n length of a number num --------------------------------------------
    function produceData (col, length) {
        var array = [];

        for (var i = 0; i < (length*indexHeight); i++) { array.push(col); }

        return array;
    }

    //console.log(vis.filteredData);


    // Helper function to test if an element is in an storageArray -------------------------------------------------------
    var contains = function(array, needle) {
        var isThere = false;

        for (var i = 0; i < array.length; i++) {
            if (array[i].name == needle) {
                return isThere || true;
            }
        }

        return isThere;
    };

    // Create new data with info about each race's mental health prevalence ----------------------------------------
    vis.mhSelection.forEach(function (mh) {
        // Add up number of people with the selected mental health for each racial category
        var nestedByRace = d3.nest()
            .key(function (person) {return person.NEWRACE2; })
            .key(function (person) {return person[mh]; })
            .rollup(function(leaves) { return leaves.length; })
            .entries(vis.filteredData);
        //console.log(nestedByRace);

        // Add to arrayStorage the data on people with the selected mental health in each racial group
        nestedByRace.forEach(function (race) {
            var numMH = 0;
            var raceName = vis.meta["NEWRACE2"][race.key];
            race.values.forEach(function (yesMHCode) {
                if (yesMHCode.key == "1") { numMH = yesMHCode.values; }
            });
            //console.log(numMH);

            //console.log(contains(arrayStorage, raceName));
            if (contains(arrayStorage, raceName)) {
                // if race object has been added to arrayStorage, then update data and percent
                var objRace;
                arrayStorage.forEach(function (race, ind) {
                    if (race.name == raceName) {
                        objRace = arrayStorage[ind];
                    }});
                var percentage = numMH / objRace.total * 100;
                var newDataPoints = produceData(color[mh], Math.round(percentage));

                objRace.percent += percentage;
                objRace.data = objRace.data.concat(newDataPoints);
            } else {
                // if race object hasn't been added to arrayStorage yet,
                // then add the race object with the total, race name, percentage, and array of datapoints
                var objStorage = {};
                objStorage.name = raceName;
                objStorage.total = 0;
                for (var i = 0; i < race.values.length; i++) {
                    objStorage.total += race.values[i].values;
                }
                objStorage.percent = numMH/objStorage.total * 100;
                objStorage.data = produceData(color[mh],Math.round(objStorage.percent));

                //console.log(objStorage);
                //console.log(arrayStorage);
                arrayStorage.push(objStorage);
                //console.log(arrayStorage);
            }
        });
        //console.log(arrayStorage);

    });

    //console.log(arrayStorage);


    // Remove race groups that have total of 0 and save to insufficient data variable ------------------------------
    vis.insufficientData = [];
    arrayStorage.forEach(function (race, ind) {
        if (race.total == 0) {
            arrayStorage.splice(ind, 1);
            vis.insufficientData.push(race.name);
        }
    });


    // Update national average for selected mental health ------------------------------------------------------------
    var sum = 0;
    arrayStorage.forEach(function (race) {
        sum += race.percent;
    });
    vis.nationalMHAvg = sum/(arrayStorage.length);
    //console.log(vis.nationalMHAvg);


    // Sort race by increasing order of percent ----------------------------------------------------------------------
    arrayStorage.sort(function (a,b) { return b.percent - a.percent});


    // Add combined AAPI info ----------------------------------------------------------------------------------------
    var indexAA,
        indexPI,
        percentAAPI,
        dataAAPI = [],
        existsAA = false,
        existsPI = false;

    arrayStorage.forEach(function (race, index) {
        if ((race.name !== "Asian American") && (existsAA == false)) {
            indexAA = -1;
        } else if (race.name == "Asian American") {
            indexAA = index;
            existsAA = true;
        }

        if ((race.name !== "Pacific Islander") && (existsPI == false)) {
            indexPI = -1;
        } else if (race.name == "Pacific Islander") {
            indexPI = index;
            existsPI = true;
        }
    });

    if ((indexAA !== -1) || (indexPI !== -1)) {
        if ((indexAA !== -1) && (indexPI !== -1)) {
            dataAAPI.length = 0;
            var objAA = arrayStorage[indexAA];
            var objPI = arrayStorage[indexPI];
            var totalAAPI = objAA.total + objPI.total;
            percentAAPI = (objAA.percent + objPI.percent)/2;

            vis.mhSelection.forEach(function (mh) {
                var counter = 0;
                vis.filteredData.forEach(function (d) {
                    if ((d.RACEGRP == 5) && (d[mh] == "1")) {
                        counter++;
                    }
                });
                var percentMH = Math.round(counter/totalAAPI*100);
                for (var j = 0; j < percentMH*indexHeight; j++) { dataAAPI.push(color[mh]); }
            });
            /*
             vis.mhFilter.forEach(function (mh) {
             var counter = 0;
             vis.filteredData.forEach(function (d) {
             if ((d.RACEGRP == 5) && (d[mh] == "1")) {
             counter++;
             }
             });
             var percentMH = Math.round(counter/totalAAPI*100);
             for (var j = 0; j < percentMH*indexHeight; j++) { dataAAPI.push(1); }
             });
             */

            //console.log(dataAAPI);
        } else if ((indexAA !== -1) && (indexPI == -1)) {
            percentAAPI = arrayStorage[indexAA].percent;
            dataAAPI = arrayStorage[indexAA].data;
        } else if ((indexAA == -1) && (indexPI !== -1)) {
            percentAAPI = arrayStorage[indexPI].percent;
            dataAAPI = arrayStorage[indexPI].data;
        }

        var aapi = {
            name: "AAPI",
            percent: percentAAPI,
            data: dataAAPI
        };

        //console.log(aapi.data);

        arrayStorage.push(aapi);
    } else if ((indexAA == -1) || (indexPI == -1)) {
        vis.insufficientData.push("AAPI");
    }


    // Fill in the rest of dataset for each racial group in arrayStorage ---------------------------------------------
    arrayStorage.forEach(function (race) {
        var numOfGray = 100*indexHeight - race.data.length;
        //console.log(race.name);
        //console.log(numOfGray);
        for (var j = 0; j < numOfGray; j++) { race.data.push(0); }
    });

    //console.log(arrayStorage);

    vis.displayData = arrayStorage;


    // Reverse displayData so AAPI appears first
    vis.displayData.reverse();


    // Update the visualization
    vis.updateVis();
}


/*
 * -------------------------------------------------------------------------------------------------------------------
 *  The drawing function
 * -------------------------------------------------------------------------------------------------------------------
 */

RacialComparison.prototype.updateVis = function() {
    var vis = this;
    var circlesPerRow = 10,
        circlesPerColumn = 20,
        totalChartSpace = vis.radius * circlesPerRow * 2.35,
        numOfCharts = vis.displayData.length,
        heightOfChart = circlesPerColumn*2*vis.radius,
        spaceBetweenAAPIAndRest = 30,
        legendWidth = 165;

    var colorCode = {
        1: "green",
        2: "red",
        3: "blue",
        4: "purple"
    };


    // Append group-elements for the visualizations for each race
    var raceChart = vis.svg.selectAll(".raceChart")
        .data(vis.displayData, function(race){ return race.name; });

    var raceChartEnter = raceChart.enter().append("g")
        .attr("class", "raceChart");

    raceChart.exit().remove();

    raceChart
        .transition()
        .duration(1500)
        .attr("transform", function (d, index) {
            if (d.name == "AAPI") {
                return "translate(" + (legendWidth + index * totalChartSpace) + ",0)";
            } else {
                return "translate(" + (legendWidth + index * totalChartSpace + spaceBetweenAAPIAndRest) + ",0)";
            }
        });

    // Append group-elements for each cell in race chart
    var raceCircle = raceChart.selectAll(".raceCircle")
        .data(function(d) { return d.data; });

    raceCircle.enter().append("circle")
        .attr("class", "raceCircle")
        .attr("opacity", 0.5)
        .attr("r", vis.radius);

    raceCircle.exit().remove();

    raceCircle
        .transition()
        .duration(1500)
        .attr("cy", function (d, index) { return vis.height - Math.floor((index/circlesPerRow))*2*vis.radius - vis.radius; })
        .attr("cx", function (d, index) { return index%circlesPerRow*2*vis.radius + vis.radius; })
        .attr("fill", function (d) {
            if (d !== 0) {
                return colorCode[d];
            } else {
                return "gray";
            }
        });
    //.on("mouseover", function(d) {});
    //on("mouseout", function(d) {});

    // Append race labels
    var raceLabel = raceChartEnter.append("text")
        .attr("class", "raceLabel");

    raceChart.select(".raceLabel")
        .text(function (d) { return d.name; })
        .attr("text-anchor", "middle")
        .attr("y", vis.height + 20)
        .attr("x", vis.radius*circlesPerRow);

    // Append percent labels
    var percentLabel = raceChartEnter.append("text")
        .attr("class", "percentLabel");

    raceChart.select(".percentLabel")
        .transition()
        .delay(1000)
        .text(function (d) { return (d.percent.toFixed(2) + "%"); })
        .attr("text-anchor", "middle")
        .attr("y", vis.height - circlesPerColumn*vis.radius*2 - 20)
        .attr("x", vis.radius*circlesPerRow);


    // Append line to indicate national mental health line
    var natMH = vis.svg.selectAll(".natMH")
        .data([vis.nationalMHAvg]);

    var natMHEnter = natMH.enter().append("g")
        .attr("class", "natMH");

    natMH.exit().remove();

    natMH
        .transition()
        .attr("transform", function (d) {
            return "translate(" + legendWidth + "," + (vis.height - heightOfChart*d/100 -2) + ")";
        });

    var natMHLine = natMHEnter.append("line")
        .attr("class", "natMHLine")
        .attr("x1", -10)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke-width", 1)
        .attr("stroke", "black");

    natMH.select(".natMHLine")
        .attr("x2", function (d) { return ((numOfCharts + 1) * totalChartSpace + spaceBetweenAAPIAndRest + 5);});

    var natMHLineLabel = natMHEnter.append("text")
        .attr("class", "natMHLineLabel")
        .attr("y", -2);

    natMH.select(".natMHLineLabel")
        .attr("x", (numOfCharts * totalChartSpace + spaceBetweenAAPIAndRest) - vis.radius*circlesPerRow/4)
        .text(function (d) { return "National Average: " + d.toFixed(2) + "%";});


    // Append percent label tooltips
    var racePercent = raceChartEnter.append("svg:title")
        .attr("class", "racePercent");

    raceChart.select(".racePercent")
        .text(function (d) { return d.percent.toFixed(2) + "%"; });

    $(".raceChart").tooltip({
        track: true
    });
}



/*
 * -------------------------------------------------------------------------------------------------------------------
 *  Function when selection changed, so update visualization
 * -------------------------------------------------------------------------------------------------------------------
 */

RacialComparison.prototype.onSelectionChange = function(selected) {
    var vis = this;
    //console.log("onselectionchange");

    /*
     * Debug
     *
     var testing = d3.nest()
     .key(function (d) {return d.EDUCCAT2})
     .rollup(function(leaves) { return leaves.length; })
     .entries(vis.data);

     console.log(testing);
     */

    // Filter data for selections
    vis.filteredData = vis.data.filter(function(person) {
        var variables = [
            ["IRSEX", "genderFilter", false],
            ["EDUCCAT2", "educationFilter", false],
            ["IRFAMIN3", "incomeSlider", false],
            ["AGECAT", "ageSlider", false]
        ];

        variables.forEach(function (variable) {
            if (selected.hasOwnProperty(variable[1])) {
                selected[variable[1]].forEach(function (d) {
                    variable[2] = (variable[2] || (person[variable[0]] == d));
                });
            } else {
                variable[2] = true;
                //console.log(person.AGECAT);
            }
        });

        return (variables.reduce(function(a, b) { return a && b[2]; }, true));
    });

    /*
     * Debug
     *
     var testing = d3.nest()
     .key(function (d) {return d.EDUCCAT2})
     .rollup(function(leaves) { return leaves.length; })
     .entries(vis.filteredData);

     console.log(testing);
     */

    /* Optional - decide
     // If no data for selections, then display error dialog
     if (vis.filteredData.length == 0) {
     $("#dialogRacialComparison").removeClass("hidden");
     }
     */


    // Save variable for the mental health filter selection
    /*
     * AMIYR_U - has a mental illness
     * AMDEYR - depression
     * MHSUITHK - seriously thought about suicide
     * ABODILAL - Alcohol abuse/dependency or illicit drug use
     */
    var varMH = {
        "1": "AMIYR_U",
        "2": "AMDEYR",
        "3": "MHSUITHK",
        "4": "ABODILAL"
    };

    vis.mhSelection = selected.mhFilter.map(function (mhSelected) {
        return varMH[mhSelected];
    });
    console.log(vis.mhSelection);

    /*
     var varMH = [
     ["AMIYR_U","1"],
     ["AMDEYR", "2"],
     ["MHSUITHK", "3"],
     ["ABODILAL", "4"]
     ];

     vis.mhFilter.length = 0;

     varMH.forEach(function (d) {
     if (selected.hasOwnProperty(d[1])) {
     vis.mhFilter.push(d[0]);
     }
     });

     if (vis.mhFilter.length == 0) {
     vis.mhFilter.push("AMIYR_U");
     }

     console.log(vis.mhFilter);
     */


    vis.wrangleData();
}