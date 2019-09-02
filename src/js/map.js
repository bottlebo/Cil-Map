const axios = require('axios')
class mapView {
  constructor(selector, settings = {}) {
    const _default = {
      width: '100%',
      height: '100%'
    }
    this._addresses = [];
    this._map = null;
    this._settings = Object.assign({}, _default, settings);
    this._element = document.getElementById(selector);
    this._element.style.width = this._settings.width;
    this._element.style.height = this._settings.height;
    this._element.classList.add("map");
    this._isMobile = ('ontouchstart' in document.documentElement)
    this.createMap();

    this.getNodesAlive().then((response) => this.createNodes(response.data)).catch((error) => console.log(error));
  }
  getNodesAlive() {
    return axios.get('http://74.119.194.8:3323/nodes',
      {
        headers: {
          "Content-Type": 'application/json;charset=UTF-8'
        }
      }
    );
  }
  createNodes(data) {
    var bounds = new google.maps.LatLngBounds();
    for (const ip of Object.keys(data.ips)) {
      const nodeData = data.ips[ip];
      if (nodeData.lat && nodeData.lon) {
        var latlng = new google.maps.LatLng(nodeData.lat, nodeData.lon);
        bounds.extend(latlng);
        //
        var marker = new google.maps.Marker({
          position: latlng, map: this._map,
          icon: {
            path: 'M18.72,8.31a10.79,10.79,0,0,0-5.17,5.24A12.74,12.74,0,0,0,14.7,26.81l9.93,14.25,9.92-14.25A12.33,12.33,0,0,0,37,19.36C37,10.6,28,4,18.72,8.31Zm6.08,15.2A4.51,4.51,0,1,1,29.3,19,4.51,4.51,0,0,1,24.8,23.51Z',
            fillColor: nodeData.alive ? '#8a65e4' : '#212121',
            fillOpacity: 1,
            strokeColor: '#f0f0f0',
            strokeWeight: 1,
            //size: new google.maps.Size(28, 39),
            //origin: new google.maps.Point(0, 256),
            anchor: new google.maps.Point(25, 40)
          },
          //label: 'W'
        });
        this._attachInfo(marker, nodeData)
      }
    }
    if(this._isMobile){
      const center = new google.maps.LatLng(30, -40)
      this._map.setCenter(center);
      this._map.panTo(center);
      this._map.setZoom(2);
    }
    else {
      this._map.fitBounds(bounds);
    }
    

  }
  /* async getGeoData() {
    let data = [];
    for (const address of this._addresses) {
      data.push({"query": address, "fields": "city,country,query,lat,lon"})
    }
    let response = await axios.post('http://ip-api.com/batch/',
      data,
      {
        headers: {
          "Content-Type": 'text/plain;charset=UTF-8'
        }
      }
    )
      .catch(function(error) {
        console.log(error);
      });
    if (response) {
      var bounds = new google.maps.LatLngBounds();
      for (const data of response.data) {
        var latlng = new google.maps.LatLng(data.lat, data.lon);
        bounds.extend(latlng);
        var marker = new google.maps.Marker({
          position: latlng, map: this._map,
          icon: {
            path: 'M18.72,8.31a10.79,10.79,0,0,0-5.17,5.24A12.74,12.74,0,0,0,14.7,26.81l9.93,14.25,9.92-14.25A12.33,12.33,0,0,0,37,19.36C37,10.6,28,4,18.72,8.31Zm6.08,15.2A4.51,4.51,0,1,1,29.3,19,4.51,4.51,0,0,1,24.8,23.51Z',
            fillColor: '#8a65e4',
            fillOpacity: 1,
            strokeColor: '#f0f0f0',
            strokeWeight: 1,
            //size: new google.maps.Size(28, 39),
            //origin: new google.maps.Point(0, 256),
            anchor: new google.maps.Point(25, 40)
          },
          //label: 'W'
        });

        this._attachInfo(marker, data)
      }
      this._map.fitBounds(bounds);
    }
  } */
  _attachInfo(marker, data) {
    const content = `<div class="info"><div>${data.country ? data.country : 'Not resolved'}, ${data.city ? data.city : ''}</div>`;
    var infowindow = new google.maps.InfoWindow({
      content: content
    });
    infowindow.data = data;
    if (this._isMobile) {
      marker.addListener('click', () => {
        infowindow.open(this._map, marker);
      });
    }
    else {
      marker.addListener('mouseover', () => {
        infowindow.open(this._map, marker);
      });
      marker.addListener('mouseout', function() {
        infowindow.close();
      });
    }
  }
  createMap() {
    var mapOptions = {
      zoom: 1,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      gestureHandling: 'cooperative',
      sensor: true
    };
    this._map = new google.maps.Map(this._element,
      mapOptions);
  }
}
module.exports = mapView