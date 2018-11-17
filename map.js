/*
 * Fetches the data from the server, 
 * then populates the page with the new information
 */
function getData() {
    
    var query = window.location.search.substring(1);
    var section = query.split("=");
    var page = "0";
    
    if(section.length > 1) {
        page = section[1];
    }
    
    var xmlhttp = new XMLHttpRequest();
    var url = "https://analog-fastness-221121.appspot.com/" + page;

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var arr = JSON.parse(this.responseText);
            console.log(arr)
            
            createNav(page, arr.isFirst);
            setDate(arr.date);
            calcSpeed(arr.speed);
            genMap(arr.waypoints);
            graph(arr.speed);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/*
 * Creates the navigation bar based on the current page index
 */
function createNav(page, isLast) {
    var pageNum = parseInt(page);
    var next = pageNum - 1;
    var prev = pageNum + 1;
    
    if(pageNum == 0) {
        document.getElementById("next").style.display = "none";
    }
    
    if(isLast) {
        document.getElementById("prev").style.display = "none";
    }
    
    document.getElementById("next").innerHTML = "<a class='nav-link' href='./?=" + next + "'><span class='nav-text'>Next</span> →</a>";
    document.getElementById("prev").innerHTML = "<a class='nav-link' href='./?=" + prev + "'>← <span class='nav-text'>Prev</span></a>";
}

/* 
 * Generates a plain-english version of the date, and sets it to title
 */
function setDate(date) {
    
    var monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    var suffixNames = [
        "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"
    ];
    
    var d = new Date(date);
    var suffix = suffixNames[(d.getDate() % 10)];
    var dateString = monthNames[d.getMonth()] + " " + d.getDate() + suffix;
    
    document.getElementById('date').innerHTML = dateString;
}

/*
 * Calculates the max and average speeds, and adds the values to the dashboard
 */
function calcSpeed(speeds) {
    var speed = new Array(speeds.length);
    for(i = 0; i < speeds.length; i++) {
        speed[i] = (parseFloat(speeds[i].amount));
    }
    var max = Math.max(...speed);
    var sum = speed.reduce((previous, current) => current += previous);
    var avg = sum / speed.length;
    
    document.getElementById('max-speed-value').innerHTML = Math.round(max);
    document.getElementById('avg-speed-value').innerHTML = Math.round(avg);
}

/*
 * Generates the map with gps route
 */
function genMap(arr) {
    
    var platform = new H.service.Platform({
        'app_id': 'qsjcw6LHc3cHp6JS1KOz',
        'app_code': '82KosHvdwFKePLOYSUC1xA',
        'useHTTPS': true
    });
    
    var targetElement = document.getElementById('mapContainer');
    var defaultLayers = platform.createDefaultLayers();
    var distance = 0.0;


    var map = new H.Map(
        document.getElementById('mapContainer'),
        defaultLayers.normal.map,
        {}
    );
    
    var routingParameters = {
        'mode': 'fastest;car',
        'representation': 'display'
    };
        
    for(i = 0; i < arr.length; i++) {
        routingParameters["waypoint" + i] = "geo!" + arr[i].lat + "," + arr[i].long;
        if(i != 0) {
            distance = distance + distanceCalc(arr[i-1].lat, arr[i-1].long, arr[i].lat, arr[i].long)
        }
    };
    
    distance = Math.round(distance * 10) / 10;
    document.getElementById('distance').innerHTML = distance;

    var onResult = function(result) {
        
        var route,
        routeShape,
        linestring;

        if(result.response.route) {
            
            route = result.response.route[0];
            routeShape = route.shape;
            linestring = new H.geo.LineString();

            
            routeShape.forEach(function(point) {
                var parts = point.split(',');
                linestring.pushLatLngAlt(parts[0], parts[1]);
            });

            
            var routeLine = new H.map.Polyline(linestring, {
                style: { strokeColor: '#000', lineWidth: 8 } // style of route line
            });
            
            // Create an icon object, an object with geographic coordinates and a marker:
            var icon = new H.map.Icon('./dot.png');
            startPoint = route.waypoint[0].mappedPosition;
            endPoint = route.waypoint[route.waypoint.length - 1].mappedPosition;

            var start = new H.map.Marker({
                lat: startPoint.latitude,
                lng: startPoint.longitude
            },{icon: icon});

            var end = new H.map.Marker({
                lat: endPoint.latitude,
                lng: endPoint.longitude
            },{icon: icon});
            
            map.addObjects([routeLine, start, end]);
            map.setViewBounds(routeLine.getBounds());
        }
    };

    var router = platform.getRoutingService();
    router.calculateRoute(routingParameters, onResult,
        function(error) {
            alert(error.message); // on error
        }
    );
    
    window.addEventListener('resize', function () {
        map.getViewPort().resize();
        
    });
}

/*
 * Calculates distance between 2 points on a globe
 */
function distanceCalc(lat1,lon1,lat2,lon2) {
    
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    
    var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c * 1000; // Distance in metres
    return d;
}

/*
 * Converts degrees to radiians (for distanceCalc())
 */
function deg2rad(deg) {
    
    return deg * (Math.PI/180);
    
}

/*
 * Generates the graph of speed
 */
function graph(speedData) {
    
    var canvas = document.getElementById("graph-canvas").getContext('2d');
    Chart.defaults.global.defaultFontFamily = "Maple";
    var labelsIn = new Array(speedData.length);
    var dataIn = new Array(speedData.length);
    
    for(i = 0; i < speedData.length; i++) {
        labelsIn[i] = (speedData[i].time);
        dataIn[i] = (parseFloat(speedData[i].amount));
    }
    
    var myChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labelsIn,
            datasets: [{
                label: 'Speed During Trip',
                data: dataIn,
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                borderColor: '#000',
                pointBackgroundColor: '#000',
                pointRadius: 4,
                borderWidth: 3,
                cubicInterpolationMode: 'default',
            }]
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    right: 8
                }
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    display: false, //minimalism
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        fontColor: '#000',
                        labelString: 'Time'
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: "#000"
                    },
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Speed (km/h)',
                        fontColor: '#000'
                    }
                }],
            }
        }
    });
    
}