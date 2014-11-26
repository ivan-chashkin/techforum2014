var arraySum = function(arr, from, to){
	var sum = 0;
	var length = 0;
	for( var i = from; i < to; i++ ){
		sum += (arr[i]||0);
		length += arr[i]?1:0;
	}
	return {
		sum: sum,
		length: length
	};
};

var chart = new Highcharts.Chart({
	chart: {
        renderTo: 'mainCharContainer',
        animation: false,
        events: {
			selection: function(evt){
				evt.preventDefault();
				var from = Math.floor( evt.xAxis[0].min );
				var to = Math.floor( evt.xAxis[0].max );
				var sum = 0;
				
				var series = evt.xAxis[0].axis.series;
				var seriesSums = [];
				for( var i = 0; i < series.length; i++ ){
					var analiticsData = arraySum(_.pluck(series[i].data, 'y'), from, to);
					seriesSums.push({
						color: series[i].color,
						sum: analiticsData.sum,
						length: analiticsData.length,
						name: series[i].name
					});
				}
				
				$analiticsBlock.empty();
				for (var i = 0; i < seriesSums.length; i++) {
					// Время в секундах
					var length = seriesSums[i].length / 1000;

					// Среднее подребление mA
					var avg = seriesSums[i].sum / length;

					// Энергия
					var energy = avg / 1000 * length;

					var tpl = analiticsTpl
								.replace(/\{color\}/g, seriesSums[i].color)
								.replace(/\{name\}/g, seriesSums[i].name)
								.replace(/\{avg\}/g, avg.toFixed(4))
								.replace(/\{energy\}/g, energy.toFixed(4))
								.replace(/\{length\}/g, length.toFixed(4))
							;

					$analiticsBlock.append(tpl);
				}
				$analiticsBlock.append('<div>' + length + ' ms</div>');

				return null;
				var selectionArr = [];
				for( var i = from; i < to; i++ ){
					sum += dataCacheL2[i];
					selectionArr.push(dataCacheL2[i]);
				}
				var length = to - from;

				

				
				selectionJSON.value = JSON.stringify(selectionArr);
				
				lifeAh.innerHTML = ( 1030 / ( sum * hour * 1000 ) ).toFixed(3);
				
			}
        },
        zoomType: 'x'
    },
    plotOptions: {
    	line: {
    		animation: false,
    		lineWidth: 1,
    		states:{
    			hover:{
    				enabled: false
    			}
    		}
    	}
    },
    title: {
        text: null,
        enabled: false
    },
    subtitle: {
        enabled: false
    },
    xAxis: {
        title: {
            text: null
        }
    },
    yAxis: {
    	min: 0,
    	max: 0.6,
        title: {
            text: 'Amperage'
        }
    },
    tooltip: {
        enabled: true
    },
    legend: {
        enabled: false
    },
    series: []
});

var graphs = [];
var showGraphs = {};
var $seriesList = $('#showedSeries');
var $analiticsBlock = $('#analiticsBlock');
var analiticsTpl = $('#analiticsTpl').html();

var addGraph = function(device, test){
	var offset = 0;
	if( typeof offsetTests[test] == 'number' ){
		offset = offsetTests[test];
	};
	var $graph = $('<div class="js-series-item series-list__item" data-device="'+device+'" data-test="'+test+'">'+device+'<br />'+test+'<br /><input type="number" value="'+offset+'"  data-device="'+device+'" data-test="'+test+'" /></div>');
	$seriesList.append($graph);
	if( !showGraphs[device] ){
		showGraphs[device] = {};
	}
	showGraphs[device][test] = {
		$graph: $graph,
		data: logsCache._cache[device][test],
		chart: undefined
	};
	var serie = showGraphs[device][test];
	var tmp = showGraphs[device][test].data;
	serie.data = [];
	for( var i = offset; i < tmp.length; i++ ){
		if( i >= 0 ){
			serie.data.push(tmp[i]);
		}else{
			serie.data.push(0);
		}
	}
	
	serie.chart = chart.addSeries({ 
		marker: {
			enabled: false
		},
		data: serie.data,
		name: test
	});
	
	$graph.css('borderColor', serie.chart.color)
	//chart.series[serie.index].update( { data: serie.data } );

};
var removeGraph = function(device, test){
	var serie = showGraphs[device][test];
	serie.$graph.remove();
	serie.chart.remove();
	delete serie;
};

/* List of devices */
var $devicesList = $('#devicesList');
var drawDevices = function(){
	var output = '';
	for( var i = 0; i < logsCache.device.length; i++ ){
		var device = logsCache.device[i];
		output += '<div class="device-item">';
		output += '<h3 class="device-item__name">'+device.name+'</h3>';
		var key = device.key;
		for( var j in logsCache._cache[key] ){
			output += '<label class="device-item__test"><input class="device-item__checkbox" type="checkbox" data-device="'+key+'" data-test="'+j+'" /> '+j+'</label>';
		}
		output += '</div>';
	}
	$devicesList.html(output);
}
drawDevices();

$devicesList.on('change', function(evt){
	var $target = $(evt.target);
	var device = $target.data('device');
	var test = $target.data('test');

	if( evt.target.checked ){
		addGraph(device, test);
	}else{
		removeGraph(device, test);
	}
});

var changeTimeout = undefined;
$seriesList.on('change', function(evt){
	var $target = $(evt.target);
	var device = $target.data('device');
	var test = $target.data('test');
	var serie = showGraphs[device][test];
	var update = [];
	var value = parseInt($target.val(), 10);

	clearTimeout(changeTimeout);
	changeTimeout = setTimeout(function(){
		var j = 0;
		for( var i = value; i < serie.data.length; i++ ){
			if( ( i < 0 ) || ( i >= serie.data.length ) ){
				update[j] = 0;
			}else{
				update[j] = serie.data[i];
			}
			j++;
		}
		serie.chart.update({
			data: update
		})
	}, 500);
	

	
});

