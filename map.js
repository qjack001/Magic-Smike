
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
            
            createNav(page);
            setDate(arr.date);
            calcSpeed(arr.speed);
            genMap(arr.waypoints);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/*
 * Creates the navigation bar based on the current page index
 */
function createNav(page) {
    var pageNum = parseInt(page);
    var next = pageNum - 1;
    var prev = pageNum + 1;
    
    if(pageNum == 0) {
        document.getElementById("next").style.display = "none";
    }
    
    document.getElementById("next").innerHTML = "<a class='nav-link' href='./?=" + next + "'><span class='nav-text'>Next</span> →</a>";
    document.getElementById("prev").innerHTML = "<a class='nav-link' href='./?=" + prev + "'>← <span class='nav-text'>Prev</span></a>";
    console.log(prev)
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
function calcSpeed(speeds)
{
    var max = Math.max(...speeds);
    var sum = speeds.reduce((previous, current) => current += previous);
    var avg = sum / speeds.length;
    
    document.getElementById('max-speed-value').innerHTML = max;
    document.getElementById('avg-speed-value').innerHTML = avg;
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
            
            map.addObjects([routeLine]);
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
    var d = R * c; // Distance in km
    return d;
}

/*
 * Converts degrees to radiians (for distanceCalc())
 */
function deg2rad(deg) {
    return deg * (Math.PI/180);
}