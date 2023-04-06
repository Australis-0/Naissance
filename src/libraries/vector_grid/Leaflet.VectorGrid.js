import {} from './Leaflet.Renderer.SVG.Tile.js';
import { PointSymbolizer } from './Symbolizer.Point.js';
import { LineSymbolizer } from './Symbolizer.Line.js';
import { FillSymbolizer } from './Symbolizer.Fill.js';

/* 🍂class VectorGrid
 * 🍂inherits GridLayer
 *
 * A `VectorGrid` is a generic, abstract class for displaying tiled vector data.
 * it provides facilities for symbolizing and rendering the data in the vector
 * tiles, but lacks the functionality to fetch the vector tiles from wherever
 * they are.
 *
 * Extends Leaflet's `L.GridLayer`.
 */

L.VectorGrid = L.GridLayer.extend({

	options: {
		// 🍂option rendererFactory = L.svg.tile
		// A factory method which will be used to instantiate the per-tile renderers.
		rendererFactory: L.svg.tile,

		// 🍂option vectorTileLayerStyles: Object = {}
		// A data structure holding initial symbolizer definitions for the vector features.
		vectorTileLayerStyles: {},

		// 🍂option interactive: Boolean = false
		// Whether this `VectorGrid` fires `Interactive Layer` events.
		interactive: false,

		// 🍂option getFeatureId: Function = undefined
		// A function that, given a vector feature, returns an unique identifier for it, e.g.
		// `function(feat) { return feat.properties.uniqueIdField; }`.
		// Must be defined for `setFeatureStyle` to work.

		// 🍂option filter: Function = undefined
		// A Function that will be used to decide whether to include a feature or not
		// depending on feature properties and zoom, e.g.
		// `function(properties, zoom) { return true; }`.
		// The default is to include all features. Similar to L.GeoJSON filter option.
	},

	initialize: function(options) {
		L.setOptions(this, options);
		L.GridLayer.prototype.initialize.apply(this, arguments);
		if (this.options.getFeatureId) {
			this._vectorTiles = {};
			this._overriddenStyles = {};
			this.on('tileunload', function(e) {
				var key = this._tileCoordsToKey(e.coords),
				    tile = this._vectorTiles[key];

				if (tile && this._map) {
					tile.removeFrom(this._map);
				}
				delete this._vectorTiles[key];
			}, this);
		}
		this._dataLayerNames = {};
	},

	createTile: function(coords, done) {

		var storeFeatures = this.options.getFeatureId;

		var tileSize = this.getTileSize();
		var renderer = this.options.rendererFactory(coords, tileSize, this.options);

		var tileBounds = this._tileCoordsToBounds(coords);	

		var vectorTilePromise = this._getVectorTilePromise(coords, tileBounds);

		if (storeFeatures) {
			this._vectorTiles[this._tileCoordsToKey(coords)] = renderer;
			renderer._features = {};
		}

		vectorTilePromise.then( function renderTile(vectorTile) {

			if (vectorTile.layers && vectorTile.layers.length !== 0) {

				for (var layerName in vectorTile.layers) {
					this._dataLayerNames[layerName] = true;
					var layer = vectorTile.layers[layerName];
	
					var pxPerExtent = this.getTileSize().divideBy(layer.extent);
	
					var layerStyle = this.options.vectorTileLayerStyles[ layerName ] ||
					L.Path.prototype.options;
	
					for (var i = 0; i < layer.features.length; i++) {
						var feat = layer.features[i];
						var id;
	
						if (this.options.filter instanceof Function &&
							!this.options.filter(feat.properties, coords.z)) {
							continue;
						}

						var styleOptions = layerStyle;
						if (storeFeatures) {
							id = this.options.getFeatureId(feat);
							var styleOverride = this._overriddenStyles[id];
							if (styleOverride) {
								if (styleOverride[layerName]) {
									styleOptions = styleOverride[layerName];
								} else {
									styleOptions = styleOverride;
								}
							}
						}
	
						if (styleOptions instanceof Function) {
							styleOptions = styleOptions(feat.properties, coords.z);
						}
	
						if (!(styleOptions instanceof Array)) {
							styleOptions = [styleOptions];
						}
	
						if (!styleOptions.length) {
							continue;
						}
	
						var featureLayer = this._createLayer(feat, pxPerExtent);
	
						for (var j = 0; j < styleOptions.length; j++) {
							var style = L.extend({}, L.Path.prototype.options, styleOptions[j]);
							featureLayer.render(renderer, style);
							renderer._addPath(featureLayer);
						}
	
						if (this.options.interactive) {
							featureLayer.makeInteractive();
						}
	
						if (storeFeatures) {
							// multiple features may share the same id, add them
							// to an array of features
							if (!renderer._features[id]) {
								renderer._features[id] = [];
							}

							renderer._features[id].push({
								layerName: layerName,
								feature: featureLayer
							});
						}
					}
	
				}
	
			}
		
			if (this._map != null) {
				renderer.addTo(this._map);
			}
	
			L.Util.requestAnimFrame(done.bind(coords, null, null));

		}.bind(this));

		return renderer.getContainer();
	},

	// 🍂method setFeatureStyle(id: Number, layerStyle: L.Path Options): this
	// Given the unique ID for a vector features (as per the `getFeatureId` option),
	// re-symbolizes that feature across all tiles it appears in.
	setFeatureStyle: function(id, layerStyle) {
		this._overriddenStyles[id] = layerStyle;

		for (var tileKey in this._vectorTiles) {
			var tile = this._vectorTiles[tileKey];
			var features = tile._features[id];
			if (features) {
				for (var i=0; i<features.length; i++) {
                    var feature = features[i];

                    var styleOptions = layerStyle;
                    if (layerStyle[feature.layerName]) {
                        styleOptions = layerStyle[feature.layerName];
                    }

                    this._updateStyles(feature.feature, tile, styleOptions);
                }
			}
		}
		return this;
	},

	// 🍂method setFeatureStyle(id: Number): this
	// Reverts the effects of a previous `setFeatureStyle` call.
	resetFeatureStyle: function(id) {
		delete this._overriddenStyles[id];

		for (var tileKey in this._vectorTiles) {
			var tile = this._vectorTiles[tileKey];
			var features = tile._features[id];
			if (features) {
				for (var i=0; i<features.length; i++) {
					var feature = features[i];

                    var styleOptions = this.options.vectorTileLayerStyles[feature.layerName] ||
                        L.Path.prototype.options;
                    this._updateStyles(feature.feature, tile, styleOptions);
                }
			}
		}
		return this;
	},

	// 🍂method setFilter(filterFn: Function): this
	// Sets filter function to filter displayed features.
	setFilter: function (filterFn) {
		this.options.filter = filterFn;
		this.redraw();
		return this;
	},

	// 🍂method getDataLayerNames(): Array
	// Returns an array of strings, with all the known names of data layers in
	// the vector tiles displayed. Useful for introspection.
	getDataLayerNames: function() {
		return Object.keys(this._dataLayerNames);
	},

	_updateStyles: function(feat, renderer, styleOptions) {
		styleOptions = (styleOptions instanceof Function) ?
			styleOptions(feat.properties, renderer.getCoord().z) :
			styleOptions;

		if (!(styleOptions instanceof Array)) {
			styleOptions = [styleOptions];
		}

		for (var j = 0; j < styleOptions.length; j++) {
			var style = L.extend({}, L.Path.prototype.options, styleOptions[j]);
			feat.updateStyle(renderer, style);
		}
	},

	_createLayer: function(feat, pxPerExtent, layerStyle) {
		var layer;
		switch (feat.type) {
		case 1:
			layer = new PointSymbolizer(feat, pxPerExtent);
			//prevent leaflet from treating these canvas points as real markers
			layer.getLatLng = null;
			break;
		case 2:
			layer = new LineSymbolizer(feat, pxPerExtent);
			break;
		case 3:
			layer = new FillSymbolizer(feat, pxPerExtent);
			break;
		}

		if (this.options.interactive) {
			layer.addEventParent(this);
		}

		return layer;
	},
});

/*
 * 🍂section Extension methods
 *
 * Classes inheriting from `VectorGrid` **must** define the `_getVectorTilePromise` private method.
 *
 * 🍂method getVectorTilePromise(coords: Object): Promise
 * Given a `coords` object in the form of `{x: Number, y: Number, z: Number}`,
 * this function must return a `Promise` for a vector tile.
 *
 */
L.vectorGrid = function (options) {
	return new L.VectorGrid(options);
};
