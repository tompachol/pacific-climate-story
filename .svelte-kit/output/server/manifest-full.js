export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["data/climate_impact_ranking_2023_final.csv","data/pacific-islands-coutries-small.geojson","data/pacific-islands-coutries.geojson","data/pacific-islands-coutries.qmd","data/pacific-islands-light.geojson","data/pacific-islands.geojson","data/pacific-islands.qmd","data/people_disasters.csv","data/renewable_energy.csv","data/sea_level_anomalies.csv"]),
	mimeTypes: {".csv":"text/csv",".geojson":"application/geo+json"},
	_: {
		client: {start:"_app/immutable/entry/start.DyXKfI2i.js",app:"_app/immutable/entry/app.n7y7-x0Q.js",imports:["_app/immutable/entry/start.DyXKfI2i.js","_app/immutable/chunks/BW7xkbjG.js","_app/immutable/chunks/DpoBZXP3.js","_app/immutable/chunks/7LGr4wv0.js","_app/immutable/entry/app.n7y7-x0Q.js","_app/immutable/chunks/CKURdWym.js","_app/immutable/chunks/DpoBZXP3.js","_app/immutable/chunks/CFWeFpuw.js","_app/immutable/chunks/Ba8sbP-i.js","_app/immutable/chunks/7LGr4wv0.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
