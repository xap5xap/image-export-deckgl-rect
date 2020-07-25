import React, { createRef } from "react";
import "./App.css";
import DeckGL from "@deck.gl/react";
import { StaticMap } from "react-map-gl";
import { GeoJsonLayer, ArcLayer } from "@deck.gl/layers";
import FileSaver from "file-saver";
// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson";

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30,
};

class App extends React.Component {
  refDeckgl = createRef();
  refMap = createRef();

  onClick = (info) => {
    if (info.object) {
      // eslint-disable-next-line
      alert(
        `${info.object.properties.name} (${info.object.properties.abbrev})`
      );
    }
  };

  handleDownload = () => {
    const fileName = "Map.png";

    if (!this.refMap.current || !this.refDeckgl.current) {
      return;
    }
    const mapGL = this.refMap.current.getMap();
    const deck = this.refDeckgl.current.deck;

    const mapboxCanvas = mapGL.getCanvas();
    deck.redraw(true);
    const deckglCanvas = deck.canvas;

    let merge = document.createElement("canvas");
    merge.width = mapboxCanvas.width;
    merge.height = mapboxCanvas.height;

    var context = merge.getContext("2d");

    context.globalAlpha = 1.0;
    context.drawImage(mapboxCanvas, 0, 0);
    context.globalAlpha = 1.0;
    context.drawImage(deckglCanvas, 0, 0);

    merge.toBlob((blob) => {
      FileSaver.saveAs(blob, fileName);
    });
  };

  render() {
    const layers = [
      new GeoJsonLayer({
        id: "airports",
        data: AIR_PORTS,
        // Styles
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getRadius: (f) => 11 - f.properties.scalerank,
        getFillColor: [200, 0, 80, 180],
        // Interactive props
        pickable: true,
        autoHighlight: true,
        onClick: this.onClick,
      }),
      new ArcLayer({
        id: "arcs",
        data: AIR_PORTS,
        dataTransform: (d) =>
          d.features.filter((f) => f.properties.scalerank < 4),
        // Styles
        getSourcePosition: (f) => [-0.4531566, 51.4709959], // London
        getTargetPosition: (f) => f.geometry.coordinates,
        getSourceColor: [0, 128, 200],
        getTargetColor: [200, 0, 80],
        getWidth: 1,
      }),
    ];
    return (
      <div>
        <button
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 100,
            backgroundColor: "yellow",
          }}
          onClick={this.handleDownload}
        >
          DOWNLOAD IMAGE!
        </button>
        <div>
          <DeckGL
            ref={this.refDeckgl}
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={layers}
          >
            <StaticMap
              ref={this.refMap}
              preserveDrawingBuffer={true}
              width="100%"
              height="100%"
              mapboxApiAccessToken={MAPBOX_TOKEN}
              mapStyle="mapbox://styles/mapbox/light-v9"
            />
          </DeckGL>
        </div>
      </div>
    );
  }
}

export default App;
