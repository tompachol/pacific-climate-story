<script>
  import { onMount } from 'svelte';
  import {
    csvParse,
    format,
    geoGraticule,
    geoMercator,
    geoPath,
    interpolateYlOrRd,
    scaleSequential
  } from 'd3';

  const WIDTH = 1800;
  const HEIGHT = 850;
  const colors = scaleSequential(interpolateYlOrRd).domain([0, 100]);
  const percentageFormat = format('.0f');
  const numberFormat = format(',');

  let countries = [];
  let graticulePath = '';
  let hoveredCountry = null;
  let loading = true;
  let errorMessage = '';
  let mapIsVisible = false;

  $: countriesWithExposure = countries.filter(({ coastalExposure }) =>
    Number.isFinite(coastalExposure)
  );

  $: highestExposure = countriesWithExposure.length
    ? countriesWithExposure.reduce((highest, country) =>
        country.coastalExposure > highest.coastalExposure ? country : highest
      )
    : null;

  $: lowestExposure = countriesWithExposure.length
    ? countriesWithExposure.reduce((lowest, country) =>
        country.coastalExposure < lowest.coastalExposure ? country : lowest
      )
    : null;

  $: averageExposure = countriesWithExposure.length
    ? countriesWithExposure.reduce(
        (sum, { coastalExposure }) => sum + coastalExposure,
        0
      ) / countriesWithExposure.length
    : null;

  $: labelledCountries = [...countriesWithExposure]
    .sort((a, b) => b.coastalExposure - a.coastalExposure)
    .slice(0, 6);

  onMount(loadData);

  async function loadData() {
    try {
      const [geoResponse, csvResponse] = await Promise.all([
        fetch('/data/pacific-islands-coutries-small.geojson'),
        fetch('/data/climate_impact_ranking_2023_final.csv')
      ]);

      if (!geoResponse.ok) {
        throw new Error(`GeoJSON error: ${geoResponse.status}`);
      }

      if (!csvResponse.ok) {
        throw new Error(`CSV error: ${csvResponse.status}`);
      }

      const geoData = await geoResponse.json();
      const rows = csvParse(await csvResponse.text());

      const projection = geoMercator()
        .rotate([180, 0])
        .center([0, -10])
        .scale(700)
        .translate([WIDTH / 2, HEIGHT / 2]);

      const path = geoPath(projection);
      graticulePath = path(geoGraticule().step([20, 10])());

      const geometryByKey = buildGeometryIndex(geoData, path);

      countries = rows
        .map((row) => {
          const country = (
            row.country ||
            row.Country ||
            row.Location ||
            row.Entity ||
            ''
          ).trim();

          const geometry = findGeometry(country, geometryByKey);

          return {
            id: normalize(country),
            country,
            coastalExposure: toNumber(
              row.coastal_population_pct_10m_2023
            ),
            peopleAffected: toNumber(row.people_affected_sum_2005_2023),
            paths: geometry?.paths ?? [],
            centroid: geometry?.centroid ?? null
          };
        })
        .filter(({ country, paths }) => country && paths.length)
        .sort((a, b) => b.coastalExposure - a.coastalExposure);

      if (!countries.length) {
        throw new Error(
          'No countries could be matched between CSV and GeoJSON.'
        );
      }
    } catch (error) {
      console.error(error);
      errorMessage = error?.message ?? 'Unknown map error';
    } finally {
      loading = false;
    }
  }

  function animateWhenVisible(node) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          mapIsVisible = true;
          observer.disconnect();
        }
      },
      {
        threshold: 0.15
      }
    );

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      }
    };
  }

  function buildGeometryIndex(geoData, path) {
    const geometryByKey = new Map();

    for (const feature of geoData.features ?? []) {
      const countryName =
        feature.properties?.country ??
        feature.properties?.name ??
        feature.properties?.ADMIN ??
        '';

      const key = normalize(countryName);
      const shape = path(feature);
      const centroid = path.centroid(feature);

      if (!key || !shape || !validPoint(centroid)) {
        continue;
      }

      const group = geometryByKey.get(key) ?? {
        paths: [],
        centroids: []
      };

      group.paths.push(shape);
      group.centroids.push(centroid);
      geometryByKey.set(key, group);
    }

    return geometryByKey;
  }

  function findGeometry(country, geometryByKey) {
    for (const alias of aliasesFor(country)) {
      const match = geometryByKey.get(normalize(alias));

      if (match) {
        return {
          paths: match.paths,
          centroid: averagePoint(match.centroids)
        };
      }
    }

    return null;
  }

  function aliasesFor(country) {
    const aliases = {
      'marshall islands': ['Marshall Is.', 'Marshall Is'],
      'micronesia, federated state of': [
        'Federated States of Micronesia',
        'Micronesia',
        'Micronesia (Federated States of)'
      ],
      'federated states of micronesia': [
        'Micronesia',
        'Micronesia (Federated States of)'
      ],
      'solomon islands': ['Solomon Is.'],
      'papua new guinea': ['Papua N. Guinea']
    };

    return [country, ...(aliases[normalize(country)] ?? [])];
  }

  function toNumber(value) {
    const number = Number(
      String(value ?? '').replace(',', '.').replace('*', '').trim()
    );

    return Number.isFinite(number) ? number : null;
  }

  function normalize(value) {
    return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function validPoint(point) {
    return point.every(Number.isFinite);
  }

  function averagePoint(points) {
    return [
      points.reduce((sum, [x]) => sum + x, 0) / points.length,
      points.reduce((sum, [, y]) => sum + y, 0) / points.length
    ];
  }

  function getColor(exposure) {
    return Number.isFinite(exposure) ? colors(exposure) : '#456071';
  }

  function markerRadius(exposure) {
    return Number.isFinite(exposure)
      ? 5 + Math.sqrt(exposure / 100) * 20
      : 4;
  }

  function labelOffset(index) {
    return (
      [
        { x: 26, y: -18 },
        { x: 26, y: 24 },
        { x: -26, y: -18 },
        { x: -26, y: 24 },
        { x: 40, y: -42 },
        { x: -40, y: 42 }
      ][index] ?? { x: 22, y: -16 }
    );
  }

  function shortName(country) {
    const names = {
      'Federated States of Micronesia': 'Micronesia',
      'Micronesia, Federated States of': 'Micronesia',
      'Marshall Islands': 'Marshall Is.',
      'Solomon Islands': 'Solomon Is.'
    };

    return names[country] ?? country;
  }

  function tooltipPosition(event) {
    const width = 230;
    const height = 115;
    const offset = 14;

    return {
      x:
        event.clientX + width + 20 > window.innerWidth
          ? event.clientX - width - offset
          : event.clientX + offset,
      y:
        event.clientY + height + 20 > window.innerHeight
          ? event.clientY - height - offset
          : event.clientY + offset
    };
  }

  function showTooltip(event, country) {
    hoveredCountry = {
      ...country,
      ...tooltipPosition(event)
    };
  }

  function moveTooltip(event) {
    if (hoveredCountry) {
      hoveredCountry = {
        ...hoveredCountry,
        ...tooltipPosition(event)
      };
    }
  }

  function hideTooltip() {
    hoveredCountry = null;
  }
</script>

{#if loading}
  <div class="state">Loading coastal exposure map...</div>
{:else if errorMessage}
  <div class="state error">{errorMessage}</div>
{:else}
  <section class="coastal-map">
    <div class="map-heading">
      <div>
        <p class="eyebrow">02 / Living at the edge</p>

        <h2>The islands are small. The exposure is not.</h2>

        <p class="intro">
          Small islands can be difficult to see on a map, but their exposure is
          not. Each point shows a Pacific location and the share of its
          population living within 10 metres of sea level.
        </p>
      </div>

      <span class="year">2023 · POPULATION IN 0–10 M ZONE</span>
    </div>

    <div class="insight-grid">
      <article class="insight-card insight-card--high">
        <span>Highest coastal exposure</span>

        <strong>
          {highestExposure
            ? `${percentageFormat(highestExposure.coastalExposure)}%`
            : '—'}
        </strong>

        <p>{highestExposure ? shortName(highestExposure.country) : '—'}</p>
      </article>

      <article class="insight-card">
        <span>Average country-level share</span>

        <strong>
          {averageExposure !== null
            ? `${percentageFormat(averageExposure)}%`
            : '—'}
        </strong>

        <p>Simple average across mapped locations</p>
      </article>

      <article class="insight-card insight-card--low">
        <span>Lowest coastal exposure</span>

        <strong>
          {lowestExposure
            ? `${percentageFormat(lowestExposure.coastalExposure)}%`
            : '—'}
        </strong>

        <p>{lowestExposure ? shortName(lowestExposure.country) : '—'}</p>
      </article>
    </div>

    <div class="map-frame" use:animateWhenVisible>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Pacific map coloured by the share of population living in the low-elevation coastal zone"
      >
        <defs>
          <pattern
            id="map-grid"
            width="150"
            height="150"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 150 0 L 0 0 0 150"
              fill="none"
              stroke="#c4d4da"
              stroke-width="1"
              opacity=".16"
            />
          </pattern>

          <radialGradient id="map-water" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stop-color="#17466a" />
            <stop offset="100%" stop-color="#071a2c" />
          </radialGradient>
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill="url(#map-water)" />
        <rect width={WIDTH} height={HEIGHT} fill="url(#map-grid)" />
        <path d={graticulePath} class="graticule" />

        {#each countries as country (country.id)}
          {#each country.paths as geometryPath}
            <path
              class="island"
              d={geometryPath}
              fill={getColor(country.coastalExposure)}
            />
          {/each}
        {/each}

        {#each countries as country, index (country.id)}
          {#if country.centroid}
            <circle
              class="exposure-marker-ring"
              class:marker-ring-enter={mapIsVisible}
              cx={country.centroid[0]}
              cy={country.centroid[1]}
              r={markerRadius(country.coastalExposure) + 3}
              style={`animation-delay: ${index * 80}ms;`}
            />

            <circle
              class="exposure-marker"
              class:marker-enter={mapIsVisible}
              class:is-hovered={hoveredCountry?.id === country.id}
              cx={country.centroid[0]}
              cy={country.centroid[1]}
              r={markerRadius(country.coastalExposure)}
              fill={getColor(country.coastalExposure)}
              style={`animation-delay: ${index * 80}ms;`}
              tabindex="0"
              role="img"
              aria-label={`${country.country}: ${percentageFormat(country.coastalExposure)}% of population living in the 0–10 metre coastal zone`}
              onmouseenter={(event) => showTooltip(event, country)}
              onmousemove={moveTooltip}
              onmouseleave={hideTooltip}
              onfocus={(event) => showTooltip(event, country)}
              onblur={hideTooltip}
            />
          {/if}
        {/each}

        {#each labelledCountries as country, index}
          {#if country.centroid}
            {@const offset = labelOffset(index)}

            <line
              class="label-line"
              x1={country.centroid[0]}
              y1={country.centroid[1]}
              x2={country.centroid[0] + offset.x}
              y2={country.centroid[1] + offset.y}
            />

            <text
              class="map-label"
              x={country.centroid[0] + offset.x + (offset.x < 0 ? -8 : 8)}
              y={country.centroid[1] + offset.y}
              text-anchor={offset.x < 0 ? 'end' : 'start'}
            >
              {shortName(country.country)} ·
              {percentageFormat(country.coastalExposure)}%
            </text>
          {/if}
        {/each}
      </svg>

      <div class="map-note">
        COASTAL EXPOSURE · {countriesWithExposure.length} MAPPED LOCATIONS
      </div>
    </div>

    {#if hoveredCountry}
      <div
        class="map-tooltip"
        style={`left: ${hoveredCountry.x}px; top: ${hoveredCountry.y}px;`}
      >
        <strong>{hoveredCountry.country}</strong>

        <span>
          {percentageFormat(hoveredCountry.coastalExposure)}% of population
          in the 0–10 m coastal zone
        </span>

        <small>
          {hoveredCountry.peopleAffected > 0
            ? `${numberFormat(hoveredCountry.peopleAffected)} reported people affected, 2005–2023`
            : 'No positive reported value in the dataset, 2005–2023'}
        </small>
      </div>
    {/if}

    <div class="legend">
      <div class="colour-legend">
        <span>Lower share</span>
        <div class="legend-gradient"></div>
        <span>Higher share</span>
      </div>

      <div class="size-legend">
        <span>Each point = one location</span>
        <span class="size-example size-example--small"></span>
        <span>low</span>
        <span class="size-example size-example--large"></span>
        <span>high</span>
      </div>
    </div>

    <p class="method-note">
      The Low Elevation Coastal Zone is a broad measure of exposure, not a
      prediction that all people in this area will be flooded. It identifies
      populations living close to sea level, where rising seas and coastal
      hazards can have greater consequences.
    </p>
  </section>
{/if}

<style>
  .state {
    display: grid;
    min-height: 420px;
    place-items: center;
    color: #9bb5d6;
  }

  .error {
    color: #ff9d9d;
  }

  .coastal-map {
    width: 100%;
    color: #09233f;
  }

  .map-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .map-heading > div {
    max-width: 780px;
  }

  .eyebrow {
    margin: 0 0 1rem;
    color: #277cb3;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  h2 {
    max-width: 17ch;
    margin: 0;
    color: #09233f;
    font-size: clamp(2.6rem, 5vw, 5rem);
    letter-spacing: -0.06em;
    line-height: 0.96;
  }

  .intro {
    max-width: 720px;
    margin: 1.5rem 0 0;
    color: #31516b;
    font-size: 1.05rem;
    line-height: 1.7;
  }

  .year {
    flex: 0 0 auto;
    padding: 0.55rem 0.75rem;
    border: 1px solid rgba(39, 124, 179, 0.25);
    border-radius: 999px;
    color: #277cb3;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-align: center;
  }

  .insight-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
    margin: 2rem 0;
  }

  .insight-card {
    min-height: 136px;
    padding: 1rem;
    border: 1px solid rgba(39, 124, 179, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.46);
  }

  .insight-card--high {
    border-color: rgba(204, 86, 34, 0.42);
  }

  .insight-card--low {
    border-color: rgba(71, 133, 177, 0.36);
  }

  .insight-card span {
    display: block;
    color: #55748b;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .insight-card strong {
    display: block;
    margin-top: 0.75rem;
    color: #09233f;
    font-size: clamp(1.5rem, 2.5vw, 2.2rem);
    line-height: 1;
  }

  .insight-card--high strong {
    color: #c95424;
  }

  .insight-card p {
    margin: 0.75rem 0 0;
    color: #31516b;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .map-frame {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(18, 61, 91, 0.3);
    border-radius: 18px;
    box-shadow: 0 20px 55px rgba(18, 61, 91, 0.16);
  }

  svg {
    display: block;
    width: 100%;
    min-width: 760px;
    height: auto;
    background: #071a2c;
  }

  .graticule {
    fill: none;
    stroke: #aac1ca;
    stroke-width: 0.8;
    opacity: 0.24;
    pointer-events: none;
  }

  .island {
    stroke: #d6e6e8;
    stroke-width: 0.9;
    opacity: 0.88;
    vector-effect: non-scaling-stroke;
  }

  .exposure-marker,
  .exposure-marker-ring {
    transform-box: fill-box;
    transform-origin: center;
  }

  .exposure-marker {
    stroke: #ffffff;
    stroke-width: 1.8;
    cursor: pointer;
    opacity: 0;
    transform: scale(0.25);
    transition:
      opacity 160ms ease,
      stroke-width 160ms ease,
      filter 160ms ease;
    vector-effect: non-scaling-stroke;
  }

  .exposure-marker-ring {
    fill: none;
    stroke: rgba(255, 255, 255, 0.72);
    stroke-width: 1;
    opacity: 0;
    transform: scale(0.25);
    pointer-events: none;
    vector-effect: non-scaling-stroke;
  }

  .marker-enter,
  .marker-ring-enter {
    animation: marker-enter 650ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes marker-enter {
    from {
      opacity: 0;
      transform: scale(0);
    }

    70% {
      opacity: 1;
      transform: scale(1.25);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .exposure-marker:hover,
  .exposure-marker.is-hovered,
  .exposure-marker:focus {
    stroke-width: 3.5;
    opacity: 1;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.75));
    outline: none;
  }

  .label-line {
    stroke: rgba(255, 255, 255, 0.82);
    stroke-width: 1.3;
  }

  .map-label {
    fill: #ffffff;
    font-size: 18px;
    font-weight: 700;
    paint-order: stroke;
    stroke: #0b2238;
    stroke-width: 5px;
    stroke-linejoin: round;
  }

  .map-note {
    position: absolute;
    top: 16px;
    left: 16px;
    color: #c7dce7;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    pointer-events: none;
  }

  .map-tooltip {
    position: fixed;
    z-index: 50;
    display: grid;
    min-width: 210px;
    max-width: 250px;
    gap: 0.45rem;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(94, 231, 255, 0.5);
    border-radius: 10px;
    background: rgba(3, 15, 30, 0.97);
    box-shadow: 0 14px 35px rgba(0, 0, 0, 0.35);
    color: #ffffff;
    pointer-events: none;
  }

  .map-tooltip strong {
    color: #5ee7ff;
    font-size: 0.92rem;
  }

  .map-tooltip span {
    color: #ffffff;
    font-size: 0.82rem;
    font-weight: 600;
    line-height: 1.4;
  }

  .map-tooltip small {
    color: #9bb5d6;
    font-size: 0.73rem;
    line-height: 1.45;
  }

  .legend {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 1.15rem;
    color: #31516b;
    font-size: 0.78rem;
  }

  .colour-legend,
  .size-legend {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  .colour-legend {
    flex: 1;
  }

  .size-legend {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .legend-gradient {
    flex: 1;
    height: 10px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      #ffffcc,
      #fed976,
      #fd8d3c,
      #e31a1c,
      #800026
    );
  }

  .size-example {
    display: inline-block;
    border-radius: 50%;
    background: #d45d29;
    box-shadow: 0 0 0 2px #ffffff;
  }

  .size-example--small {
    width: 8px;
    height: 8px;
  }

  .size-example--large {
    width: 18px;
    height: 18px;
  }

  .method-note {
    max-width: 900px;
    margin: 1.5rem 0 0;
    color: #55748b;
    font-size: 0.82rem;
    line-height: 1.6;
  }

  @media (max-width: 850px) {
    .map-heading {
      display: block;
    }

    .year {
      display: inline-block;
      margin-top: 1.25rem;
    }

    .insight-grid {
      grid-template-columns: 1fr;
    }

    .map-frame {
      overflow-x: auto;
    }

    .legend {
      align-items: flex-start;
      flex-direction: column;
      gap: 1rem;
    }

    .colour-legend,
    .size-legend {
      width: 100%;
    }

    .size-legend {
      white-space: normal;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .exposure-marker,
    .exposure-marker-ring {
      opacity: 1;
      transform: none;
    }

    .marker-enter,
    .marker-ring-enter {
      animation: none;
    }
  }
</style>