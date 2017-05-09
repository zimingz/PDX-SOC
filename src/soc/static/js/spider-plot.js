var spiderPlotGraph = (function() {
	var myPlot;
	var xAxisMax = 0;
    var xAxisMin = 0;
    var grouplist = [];
	
	return {
		setGraphNode: function(graphDiv) {
            myPlot = graphDiv;
        },
        renderPlot: function(animals, groupMap, study) {
            var traces = animals.map(function(animal) {
                var group = groupMap[animal.group_name];
                var showLegend = false;
                
                if(grouplist.indexOf(group.groupLabel) === -1) {
                    grouplist.push(group.groupLabel);
                    showLegend = true;
                }
				
                if(group.nearEndMeasDay > xAxisMax) xAxisMax = group.nearEndMeasDay;
                if(group.nearStartMeasDay < xAxisMin) xAxisMin = group.nearStartMeasDay;
                
                return {
                    name: group.groupLabel,
                    x: animal.measurements.map(function(meas) {return meas.measurement_day}),
                    y: animal.measurements.map(function(meas) {return meas.measurement_value}),
                    text: animal.measurements.map(function(meas) {
                        return " ID: <b>" + animal.animal_name 
                            + "</b> ; DAY: <b>" + meas.measurement_day 
                            + "</b> ; VOLUME: <b>" + Math.round(meas.measurement_value) + "</b> ";
                        }
                    ),
                    type: 'scatter',
                    mode: 'lines',
                    showlegend: showLegend,
					legendgroup: group.groupLabel,
                    hoverinfo: 'text',
                    marker: {
                        color: (group.color !== null) ? group.color : colors[group.index % colors.length]
                    }
                }
            });
            
            var layout = {
                autosize: false,
                title: study.curated_study_name,
                titlefont: {
                    family: 'helvetica',
                    size: 19
                },
                yaxis: {
                    title: 'Tumor Volume (mm<sup>3</sup>)',
                    titlefont: {
                        family: 'helvetica',
                        size: 19
                    },
					ticks: "outside",
                    ticksuffix: " "
                },
                xaxis: {
                    title: 'Day of Study',
                    titlefont: {
                        family: 'helvetica',
                        size: 19
                    }
                },
                width: myPlot.offsetWidth,
                height: myPlot.offsetHeight,
                legend: {
                    bgcolor: 'none',
                    x: 0.05,
                    y: 0.95
                },
                hovermode: 'closest'
            };
            
			Plotly.newPlot(myPlot, traces, layout, modebar);
        }
    };
}());