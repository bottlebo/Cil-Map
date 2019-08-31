const axios = require('axios')
class mapView {
  constructor(selector, settings = {}) {
    const _default = {
      width: '100%',
      height: '100%'
    }
    this._addresses = [];
    this._map = null;
    this._nodeState = {};
    this._settings = Object.assign({}, _default, settings);
    this._element = document.getElementById(selector);
    this._element.style.width = this._settings.width;
    this._element.style.height = this._settings.height;
    this.createMap();
    this.getWitnesses().then(() => this.getGeoData())
  }
  async getGeoData() {
    let data = [];
    for (const address of this._addresses) {
      data.push({"query": address, "fields": "city,country,query,lat,lon"})
    }
    console.log(data)
    let response = await axios.post('http://ip-api.com/batch/',
      //JSON.stringify(data),
      data,
      {
        headers: {
          "Content-Type": 'text/plain;charset=UTF-8'
          //"Authorization": "Basic dWJpa2lyaTo2MjJjYTg4YzRlMmVhODAyMTc=",
          // "cache-control": "no-cache"
        }
      }
    )
      .catch(function(error) {
        console.log('***', error);
      });
    console.log(response)
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
  }
  _attachInfo(marker, data) {
    const content = `<div class="info"><div>${data.country}, ${data.city}</div>` +''
      //'<div><span>Alive: </span><span>1</span></div></div>'
      ;
    var infowindow = new google.maps.InfoWindow({
      content: content
    });
    infowindow.data = data;
    marker.addListener('mouseover', () => {
      console.log(infowindow.data)
      infowindow.open(this._map, marker);
      //this._testAlive('74.119.195.11'/* data.query */, infowindow)
    });
    marker.addListener('mouseout', function() {
      infowindow.close();
    });
  }
  _testAlive(ip, infowindow) {
    const content = `<div class="info"><div>${infowindow.data.country}, ${infowindow.data.city}</div>` +
      '<div><span>Alive: </span><span>ok</span></div></div>'
      ;
    var ws = new WebSocket("wss://ws2s.feling.io/")
    console.log(ws)
    ws.onmessage = (event) => {
      console.log("onmessage: ", event.data)
      if (event.data.message == 'connect done') {
        console.log('=')
        infowindow.setContent(content)
      }
    }
    ws.onopen = () => {
      console.log("onopen")
      ws.send(JSON.stringify(
        {
          command: "connect",
          host: ip,
          port: 8223
        }
      ));
      //ws.close()
      // ws.send(JSON.stringify(
      //     {
      //         command: "send",
      //         data: "GET / HTTP/1.1\r\nHost: 74.119.195.11:8223\r\nConnection111: close222\r\n\r\n"
      //     }
      // ));
      ws.send(JSON.stringify(
        {
          command: "close"
        }
      ));
    }

    ws.onclose = () => {
      console.log("onclose")
    }
  }
  createMap() {
    let centerX = 55.7557; //начальные координаты - город Москва
    let centerY = 37.6176;
    var latlng = new google.maps.LatLng(centerX, centerY);
    var myOptions = {
      zoom: 1,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      gestureHandling: 'cooperative'
    };
    this._map = new google.maps.Map(document.getElementById("Map"),
      myOptions);
    // var infowindow = new google.maps.InfoWindow({
    //   content: "gggg"
    // });
    // var marker = new google.maps.Marker({
    //   position: latlng, map: this._map
    // });
    // //markers.push(marker);
    // google.maps.event.addListener(marker, 'click', function() {
    //   infowindow.open(this._map, marker);
    // });
  }
  async getWitnesses() {
    let response = await axios.post('http://74.119.194.8:8222',
      {

        "jsonrpc": "2.0",
        "method": "getWitnesses",
        "params": {},
        "id": 67
      },
      {
        headers: {
          "Content-Type": 'application/json',
          "Authorization": "Basic dWJpa2lyaTo2MjJjYTg4YzRlMmVhODAyMTc=",
          // "cache-control": "no-cache"
        }
      }
    )
      // .then(function(response) {
      //   console.log(response.data.result);
      //   let result = response.data.result;
      //   for(let r of Object.values(result)){
      //     console.log(r)
      //   }
      // })
      .catch(function(error) {
        console.log(error);
      });
    //console.log(response.data.result)
    let result = response.data.result;
    for (let r of Object.values(result)) {
      //console.log(r)
      this._addresses.push(r.address)
    }
  }
}
module.exports = mapView