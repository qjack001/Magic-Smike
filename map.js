
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
    
    document.getElementById("next").innerHTML = "<a class='nav-link' href='/?=" + next + "'>Next →</a>";
    document.getElementById("prev").innerHTML = "<a class='nav-link' href='./?=" + prev + "'>← Prev</a>";
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
        'app_code': '82KosHvdwFKePLOYSUC1xA'
    });
    
    var targetElement = document.getElementById('mapContainer');
    var defaultLayers = platform.createDefaultLayers();


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
    };

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
