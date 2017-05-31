"use strict"

/**
* @file: socstudy.js
* @fileOverview 
* @author Georgi Kolishovski
* @version 1.0
*/

var socstudy;

(function(socstudy) {
    // module scoped variables
    let study = {};
    let treatments = [];
    let measurements = [];
    let animals = [];
    let groupLabels = [];

    /**
    * class to execute the actual plot(s) rendering;
    * plot rendering operation has been separated in
    * a class witihn the module so that design patterns could
    * be applied as the application becomes more complex
    */
    let PlotFactory = (function() {
        // constructor
        function PlotFactory() { }

        PlotFactory.prototype.renderWaterfallPlot = function() {
            var waterfallChgTypeSel = $("[id=waterfall-change-type-select]");

            var waterfallPlotNode = document.getElementById('waterfall-plot');
            waterfallPlotGraph.setGraphNode(waterfallPlotNode);
            // event handler
            waterfallChgTypeSel.change(function() {
                waterfallPlotGraph.renderPlot(waterfallChgTypeSel.val(), animals, groups, study);
            });
            waterfallPlotGraph.renderPlot(waterfallChgTypeSel.val(), animals, groups, study);
        }

        PlotFactory.prototype.renderTreatmentGroupsPlot = function() {
            var treatGrpChgTypeSel = $("[id=treatment-group-change-type-select]");			

            var treatmentGroupPlotNode = document.getElementById('treatment-group-plot');
            treatmentGroupPlotGraph.setGraphNode(treatmentGroupPlotNode);
            // event handler
            treatGrpChgTypeSel.change(function() {
                treatmentGroupPlotGraph.renderPlot(treatGrpChgTypeSel.val(), measurements, treatments, groups, study);
            });
            treatmentGroupPlotGraph.renderPlot(treatGrpChgTypeSel.val(), measurements, treatments, groups, study);
        }

        PlotFactory.prototype.renderSpiderPlot = function() {
            var spiderPlotNode = document.getElementById('spider-plot');
            spiderPlotGraph.setGraphNode(spiderPlotNode);
            spiderPlotGraph.renderPlot(animals, groupMap, study);
        }

        PlotFactory.prototype.renderTGIPlot = function() {
            var tgiPlotNode = document.getElementById('tgi-plot');
            tgiPlotGraph.setGraphNode(tgiPlotNode);
            tgiPlotGraph.renderPlot(groups, study);
        }

        PlotFactory.prototype.renderRecistPanel = function() {
            var recistPanelNode = document.getElementById("recist-info-panel");
            recistPanel.setPanelNode(recistPanelNode);
            recistPanel.renderTable(groups, study);
        }

        return PlotFactory;
    })();
    
    // public module members
    socstudy.PlotFactory = PlotFactory;

    /* 
	* receives data from template & sets module variables
	* @param {Object} params:
    *                                  {study: study_data,
    *                                   measurements: measurements_data,
    *                                   treatments: treatments_data,
    *                                   animals: animals_data,
    *                                   groupLabels: groupLabels_data}
	*/
    socstudy.initStudyData = function(params) {
        if(params.study !== "undefined") {
            study = params.study;
        }

        if(params.treatments !== "undefined") {
            treatments = params.treatments;
		}

        if(params.measurements !== "undefined") {
            measurements = params.measurements;
        }

        if(params.animals !== "undefined") {
            animals = params.animals;
        }

        if(params.groupLabels !== "undefined") {
            groupLabels = params.groupLabels;
        };

        setDataStructs();
    }

    var groupMap = {};
    var groups = [];
    var animalMap = {};

    /*
    * constructs data structures used during plot rendering
    * 
    * 
    */
    function setDataStructs() {
        animals.forEach(function(animal) {
            animal.measurements = [];
            animal.treatments = [];

            let grpName = animal['group_name'];
            let animalName = animal['animal_name'];
            if(typeof(groupMap[grpName]) === 'undefined') {
                var group = {
                    color: null,
                    doseActivities: [],
                    doseUnits: [],
                    doseAmounts: [],
                    isControl: 0,
                    recistCat: null,
                    uniqTreatDays: [],
                    uniqMeasureDays: [],
                    animals: [],
                    groupName: grpName,
                    groupLabel: null
                };
                groupMap[grpName] = group;
                groups.push(group);
            }

            groupMap[grpName].animals.push(animal);
            animalMap[animalName] = animal;
        });

        // sort groups alphabetically
        groups.sort(function(g1, g2) {
            return g1.groupName.localeCompare(g2.groupName);
        });

        measurements.forEach(function(measurement) {
            var grpName = measurement['group_name'];
            var animalName = measurement['animal_name'];
            var grp = groupMap[grpName];
            var day = measurement['measurement_day'];
            insertUnique(grp.uniqMeasureDays, day);
            animalMap[animalName].measurements.push(measurement);
        });

        treatments.forEach(function(treatment) {
            var grpName = treatment['group_name'];
            var animalName = treatment['animal_name'];
            var grp = groupMap[grpName];
            var day = treatment['treatment_day'];
            insertUnique(grp.uniqTreatDays, day);
            insertUnique(grp.doseActivities, treatment['dose_activity'], compareBasic);
            insertUnique(grp.doseUnits, treatment['administration_route_units'], compareBasic);
            insertUnique(grp.doseAmounts, treatment['test_material_amount']);
            animalMap[animalName].treatments.push(treatment);
        });

        $.each(groupMap, function(grpName, group) {
            group.nearStartMeasIdx = findNearestMeasureDayIdx(group.uniqMeasureDays, 0);
            group.nearEndMeasIdx = 
                findNearestMeasureDayIdx(group.uniqMeasureDays, group.uniqMeasureDays[group.uniqMeasureDays.length - 1]);
            group.nearStartMeasDay = group.uniqMeasureDays[group.nearStartMeasIdx];
            group.nearEndMeasDay = group.uniqMeasureDays[group.nearEndMeasIdx];

            for(var i = 0; i < groupLabels.length; i++) {
                if(groupLabels[i].group_name === group.groupName) { console.log(group.groupLabel);
                    if(groupLabels[i].curated_group_name !== "") {
                        group.groupLabel = groupLabels[i].curated_group_name;
				    } else if(group.doseActivities.length <= 0)  { 
                        group.groupLabel = "No Treatment";
					} else { console.log(group.doseActivities);
                        group.groupLabel = 
                            group.doseActivities.join(', ') + 
                            ' (' + group.doseAmounts.join(', ') + ' ' + group.doseUnits.join(', ') + ')';
                    }
                    console.log(group.groupLabel);
					// console.log(groupLabels[i]);
					group.recistCat = groupLabels[i].recist;
					if(groupLabels[i].is_control === 1) group.isControl = 1;
                    if(groupLabels[i].color !== null) group.color = groupLabels[i].color;
                }
            }
        });
        
		// vehicle group needs to be at first position
        var controlIndex = 0;
        for(var i = 0; i < groups.length; i++) { 
            if(groups[i].isControl === 1) {
                controlIndex = i;
            }
        }
		groups.splice(0, 0, groups[controlIndex]);
        groups.splice(controlIndex+1, 1);
        
        groups.forEach(function(group, i) {
            group.index = i;
        });
        
        animals.forEach(function(animal) {
            var grpName = animal['group_name'];
            var grp = groupMap[grpName];

            var measStart = null;
            var measEnd = null;
            animal.measurements.forEach(function(measurement) {
                if(measurement.measurement_day === grp.nearStartMeasDay) {
                    measStart = measurement;
                }
                if(measurement.measurement_day === grp.nearEndMeasDay) {
                    measEnd = measurement;
                }
            });

            if(measEnd === null && animal.measurements.length) {
                var lastMeas = animal.measurements[animal.measurements.length - 1];
                if(lastMeas.measurement_day < grp.nearEndMeasDay) {
                    // indicates that the animal died early
                    // TODO add some visual indication for these animals
                    measEnd = lastMeas;
                }
            }

            if(measStart === null || measEnd === null) {
                console.error('bad measurement for animal: ' + animal.animal_name);
            }
            animal.start_day_measurement = measStart;
            animal.end_day_measurement = measEnd;
            animal.percent_change_volume = Math.round(((measEnd.measurement_value / measStart.measurement_value) * 100) - 100);
			animal.measurement_diff = Math.round(measEnd.measurement_value - measStart.measurement_value);
            animal.measurement_fold_change = parseFloat(Math.round((animal.measurement_diff / measStart.measurement_value + 0.00001) * 100) / 100).toFixed(2);
        });
	
        let plots = new socstudy.PlotFactory();
        plots.renderRecistPanel();
        plots.renderWaterfallPlot();
        plots.renderTreatmentGroupsPlot();
        plots.renderSpiderPlot();
        plots.renderTGIPlot();
    }

})(socstudy || (socstudy = {}));