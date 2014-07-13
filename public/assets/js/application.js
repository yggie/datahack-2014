'use strict';

angular.module('TradeTalk', ['Voices']);

angular.module('Voices', [])
  .constant('Call', (function() {

    function Call(elements, origin, dest) {
      this.date = elements[0];
      this.hour = elements[1];
      this.from = elements[2];
      this.to = elements[3];
      this.duration = elements[6];

      this.origin = origin;
      this.dest = dest;
    }

    return Call;
  })())
  .constant('Location', (function() {
    var color = d3.scale.category20();

    function Location(city, country, lat, lon) {
      this.city = city;
      this.country = country;
      this.lat = parseFloat(lat);
      this.lon = parseFloat(lon);
      this.color = color(Math.floor(Math.random() * 20));
    }

    Location.prototype.coords = function() {
      return [this.lon, this.lat];
    };

    return Location;
  })())
  .service('VoicesService', function($http, Call, Location) {
    var self = this;

    self.locations = {};
    self.calls = [];
    var observers = [];

    self.registerObserver = function(observer) {
      observer.call(null, self);
      observers.push(observer);
    }

    $http({ method: 'GET', url: '/voices' })
      .success(function(data, status, headers, config) {
        parseCSV(data);
      }).error(function(data, status, headers, config) {
        alert(data);
      });

    function findOrCreateLocation(slice) {
      return self.locations[slice[0]] || (function(s) {
        self.locations[s[0]] = new Location(s[0], s[1], s[2], s[3]);
        return self.locations[s[0]];
      })(slice);
    }

    function createCall(elements, origin, dest) {
      self.calls.push(new Call(elements, origin, dest));
    }

    function notifyUpdate() {
      for (var i = 0; i < observers.length; i++) {
        observers[i].call(null, self);
      }
    }

    function parseCSV(string) {
      var trimmed = string.trim();
      var rows = trimmed.split("\n");
      var headers = rows[0].split(',');

      for (var i = 1; i < rows.length; i++) {
        parseRow(rows[i].split(','));
      }

      notifyUpdate();
    }

    function parseRow(elements) {
      var origin = findOrCreateLocation(elements.slice(7, 11));
      var dest = findOrCreateLocation(elements.slice(12, 16));

      createCall(elements, origin, dest);
    }
  })
  .directive('ttCallMap', function(VoicesService) {
    var svg, projection, points, index, scope,
        line = d3.svg.line()
            .x(function(d) { return projection(d)[0]; })
            .y(function(d) { return projection(d)[1]; });

    index = 0;
    function onVoiceDataUpdate(service) {
      index = 0;
      updateDisplayedData(service);
    }

    function updateDisplayedData(service) {
      var calls = service.calls;
      if (calls.length > 0) {
        index = (index + 1) % calls.length;
        var slice = service.calls.slice(index, Math.min(index + 30, calls.length));

        if (points) { points.remove(); }
        points = svg.selectAll('.routes').data(slice, function(d) { return service.calls.indexOf(d); })
            .attr('d', d)
          .enter().append('svg:path')
            .attr('class', 'routes')
            .attr('d', d)
            .style('fill', 'none')
            .style('stroke', color)
            .style('stroke-width', 2)
            .style('opacity', 0.6);
      }
    }

    function d(d) {
      var i = d3.geo.interpolate(d.origin.coords(), d.dest.coords());
      return line([i(0), i(0.2), i(0.4), i(0.6), i(0.8), i(1.0)]);
    }

    function x(d) {
      var loc = VoicesService.locations[d];
      return projection([loc.lon, loc.lat])[0];
    }

    function y(d) {
      var loc = VoicesService.locations[d];
      return projection([loc.lon, loc.lat])[1];
    }

    function r(d) {
      return 1;
    }

    function color(d) {
      return d.origin.color;
    }

    function link($scope, element, attr, controller) {
      scope = $scope;
      var width = 600,
          height = 600;

      var sc = Math.min(width,height) * 0.5;
      var lat = -180;
      // projection = d3.geo.equirectangular()
      //     .scale(sc * 0.5)
      //     .translate([width/2, height/2])
      //     .rotate([lat, 0]);
      projection = d3.geo.orthographic()
          .scale(sc)
          .translate([width/2, height/2])
          .rotate([lat, 0])
          .clipAngle(90);
      var path = d3.geo.path()
          .projection(projection);

      var graticule = d3.geo.graticule();

      svg = d3.select(element[0]).append("svg")
          .attr("width", width)
          .attr("height", height);

      svg.selectAll('.land')
          .data([topojson.object(worldtopo, worldtopo.objects.countries)])
        .enter().append('path')
          .attr('class','land')
          .attr('d', path);

      points = svg.selectAll('path.routes').data([]);

      setInterval(function() {
        lat = lat + 0.2;
        projection.rotate([lat, 0]);
        svg.selectAll('.land')
            .attr('d', path);

        updateDisplayedData(VoicesService);
        // points.attr('cx', x).attr('cy', y);
      }, 15);

      VoicesService.registerObserver(onVoiceDataUpdate);
    }

    return {
      restrict: 'E',
      template: '',
      link: link
    }
  }).directive('ttClock', function() {
    var radians = 0.0174532925,
      clockRadius = 200,
      margin = 50,
      width = (clockRadius+margin)*2,
      height = (clockRadius+margin)*2,
      hourHandLength = 2*clockRadius/3,
      minuteHandLength = clockRadius,
      secondHandLength = clockRadius-12,
      secondHandBalance = 30,
      secondTickStart = clockRadius,
      secondTickLength = -10,
      hourTickStart = clockRadius,
      hourTickLength = -18,
      secondLabelRadius = clockRadius + 16,
      secondLabelYOffset = 5,
      hourLabelRadius = clockRadius - 40,
      hourLabelYOffset = 7;


    var hourScale = d3.scale.linear()
        .range([0,330])
        .domain([0,11]);

    var minuteScale = d3.scale.linear()
        .range([0,354])
        .domain([0,59]);
    var secondScale  = minuteScale;

    var handData = [
      {
      type:'hour',
      value:0,
      length:-hourHandLength,
      scale:hourScale
    },
    {
      type:'minute',
      value:0,
      length:-minuteHandLength,
      scale:minuteScale
    },
    {
      type:'second',
      value:0,
      length:-secondHandLength,
      scale:secondScale,
      balance:secondHandBalance
    }
    ];

    function link(scope, element, attr, controller) {
      function drawClock(){ //create all the clock elements
        updateData(); //draw them in the correct starting position
        var svg = d3.select(element[0]).append("svg")
        .attr("width", width)
        .attr("height", height);

        var face = svg.append('g')
        .attr('id','clock-face')
        .attr('transform','scale(0.5) translate(' + (clockRadius + margin) + ',' + (clockRadius + margin) + ')');

        //add marks for seconds
        face.selectAll('.second-tick')
        .data(d3.range(0,60)).enter()
        .append('line')
        .attr('class', 'second-tick')
        .attr('x1',0)
        .attr('x2',0)
        .attr('y1',secondTickStart)
        .attr('y2',secondTickStart + secondTickLength)
        .attr('transform',function(d){
          return 'rotate(' + secondScale(d) + ')';
        });
        //and labels

        face.selectAll('.second-label')
        .data(d3.range(5,61,5))
        .enter()
        .append('text')
        .attr('class', 'second-label')
        .attr('text-anchor','middle')
        .attr('x',function(d){
          return secondLabelRadius*Math.sin(secondScale(d)*radians);
        })
        .attr('y',function(d){
          return -secondLabelRadius*Math.cos(secondScale(d)*radians) + secondLabelYOffset;
        })
        .text(function(d){
          return d;
        });

        //... and hours
        face.selectAll('.hour-tick')
        .data(d3.range(0,12)).enter()
        .append('line')
        .attr('class', 'hour-tick')
        .attr('x1',0)
        .attr('x2',0)
        .attr('y1',hourTickStart)
        .attr('y2',hourTickStart + hourTickLength)
        .attr('transform',function(d){
          return 'rotate(' + hourScale(d) + ')';
        });

        face.selectAll('.hour-label')
        .data(d3.range(3,13,3))
        .enter()
        .append('text')
        .attr('class', 'hour-label')
        .attr('text-anchor','middle')
        .attr('x',function(d){
          return hourLabelRadius*Math.sin(hourScale(d)*radians);
        })
        .attr('y',function(d){
          return -hourLabelRadius*Math.cos(hourScale(d)*radians) + hourLabelYOffset;
        })
        .text(function(d){
          return d;
        });


        var hands = face.append('g').attr('id','clock-hands');

        face.append('g').attr('id','face-overlay')
        .append('circle').attr('class','hands-cover')
        .attr('x',0)
        .attr('y',0)
        .attr('r',clockRadius/20);

        hands.selectAll('line')
        .data(handData)
        .enter()
        .append('line')
        .attr('class', function(d){
          return d.type + '-hand';
        })
        .attr('x1',0)
        .attr('y1',function(d){
          return d.balance ? d.balance : 0;
        })
        .attr('x2',0)
        .attr('y2',function(d){
          return d.length;
        })
        .attr('transform',function(d){
          return 'rotate('+ d.scale(d.value) +')';
        });
      }

      function moveHands(){
        d3.select('#clock-hands').selectAll('line')
          .data(handData)
          .transition()
          .attr('transform',function(d){
            return 'rotate('+ d.scale(d.value) +')';
          });
      }

      function updateData(){
        var t = new Date();
        handData[0].value = (t.getHours() % 12) + t.getMinutes()/60 ;
        handData[1].value = t.getMinutes();
        handData[2].value = t.getSeconds();
      }

      drawClock();

      setInterval(function(){
        updateData();
        moveHands();
      }, 200);

      d3.select(self.frameElement).style("height", height + "px");
    }

    return {
      restrict: 'E',
      template: '',
      link: link
    }
  });
