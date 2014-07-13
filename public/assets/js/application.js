'use strict';

angular.module('Power2ThePeople', ['Voices']);

angular.module('Voices', [])
  .constant('Call', (function() {

    function Call(elements, origin, dest) {
      this.date = elements[0];
      this.hour = elements[1];
      this.from = elements[2];
      this.to = elements[3];
      this.duration = elements[6];
    }

    return Call;
  })())
  .constant('Location', (function() {

    function Location(city, country, lat, lon) {
      this.city = city;
      this.country = country;
      this.lat = lat;
      this.lon = lon;
    }

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
  .directive('p2pVoicesMap', function(VoicesService) {
    var svg, projection, points;

    function onVoiceDataUpdate(service) {
      points = svg.selectAll('.points').data(Object.keys(service.locations))
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 5)
          .style('fill', 'red');

      points.enter().append('circle')
          .attr('class', 'points')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', r)
          .style('fill', 'red');
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

    function link(scope, element, attr, controller) {
      var width = 600,
          height = 600;

      var sc = Math.min(width,height) * 0.5;
      var lat = -180;
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

      setInterval(function() {
        lat = lat + 0.2;
        projection.rotate([lat, 0]);
        svg.selectAll('.land')
            .attr('d', path);

        points.attr('cx', x).attr('cy', y);
      }, 15);

      VoicesService.registerObserver(onVoiceDataUpdate);
    }

    return {
      restrict: 'E',
      template: '',
      link: link
    }
  });
