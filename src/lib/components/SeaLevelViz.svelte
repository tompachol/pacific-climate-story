<script>
  import { onMount } from 'svelte';
  import { dsvFormat } from 'd3-dsv';

  let years = [];
  let countries = [];
  let loading = true;
  let error = '';

  const chartWidth = 1100;
  const rowHeight = 34;
  const margin = { top: 34, right: 32, bottom: 54, left: 190 };

  $: chartHeight =
    margin.top + countries.length * rowHeight + margin.bottom;

  $: plotWidth = chartWidth - margin.left - margin.right;
  $: cellWidth = years.length ? plotWidth / years.length : 0;

  $: allPoints = countries.flatMap((country) =>
    years
      .map((year) => ({
        country: country.name,
        year,
        value: country.values[year]
      }))
      .filter((point) => Number.isFinite(point.value))
  );

  $: highestValue = allPoints.length
  ? Math.max(...allPoints.map((point) => point.value))
  : null;

$: lowestValue = allPoints.length
  ? Math.min(...allPoints.map((point) => point.value))
  : null;

$: highestPoints =
  highestValue === null
    ? []
    : allPoints.filter((point) => point.value === highestValue);

$: lowestPoints =
  lowestValue === null
    ? []
    : allPoints.filter((point) => point.value === lowestValue);

  $: latestYear = years[years.length - 1] ?? '';

  $: latestValues = countries
    .map((country) => ({
      name: country.name,
      value: country.values[latestYear]
    }))
    .filter((item) => Number.isFinite(item.value));

  $: latestAverage = latestValues.length
    ? latestValues.reduce((sum, item) => sum + item.value, 0) /
      latestValues.length
    : null;

  onMount(async () => {
    try {
      const response = await fetch('/data/sea_level_anomalies.csv');

      if (!response.ok) {
        throw new Error('Could not load sea_level_anomalies.csv.');
      }

      const text = await response.text();
      const delimiter = text.split(/\r?\n/)[0].includes(';') ? ';' : ',';
      const rows = dsvFormat(delimiter).parse(text);

      if (!rows.length) {
        throw new Error('The CSV file does not contain data.');
      }

      years = Object.keys(rows[0])
        .filter((key) => /^\d{4}$/.test(key))
        .sort((a, b) => Number(a) - Number(b));

      countries = rows
        .map((row) => {
          const name =
            row.Country ||
            row.country ||
            row.Location ||
            row.Entity ||
            Object.values(row).find((value) => value?.trim());

          const values = Object.fromEntries(
            years.map((year) => [year, parseValue(row[year])])
          );

          const availableValues = Object.values(values).filter((value) =>
            Number.isFinite(value)
          );

          return {
            name: name?.trim(),
            values,
            average: availableValues.length
              ? availableValues.reduce((sum, value) => sum + value, 0) /
                availableValues.length
              : null
          };
        })
        .filter((country) => country.name && country.average !== null)
        .sort((a, b) => b.average - a.average);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unexpected error.';
    } finally {
      loading = false;
    }
  });

  function parseValue(value) {
    if (value === undefined || value === null || String(value).trim() === '') {
      return null;
    }

    const clean = String(value)
      .replace(',', '.')
      .replace('*', '')
      .trim();

    const number = Number(clean);

    return Number.isFinite(number) ? number * 100 : null;
  }

  function cellX(index) {
    return margin.left + index * cellWidth;
  }

  function cellY(index) {
    return margin.top + index * rowHeight;
  }

  function shortName(name) {
    const names = {
      'Micronesia, Federated States of': 'Micronesia',
      'Marshall Islands': 'Marshall Is.',
      'Solomon Islands': 'Solomon Is.',
      'Papua New Guinea': 'Papua New Guinea',
      'American Samoa': 'American Samoa',
      'French Polynesia': 'French Polynesia'
    };

    return names[name] ?? name;
  }

  function formatCentimetres(value) {
    if (!Number.isFinite(value)) {
      return 'No data';
    }

    return `${value > 0 ? '+' : ''}${value.toFixed(1)} cm`;
  }

  function formatCardCentimetres(value) {
  if (!Number.isFinite(value)) {
    return 'No data';
  }

  return `${value > 0 ? '+' : ''}${value.toFixed(2)} cm`;
}

function formatExtremeLocations(points) {
  if (!points.length) {
    return 'No data';
  }

  if (points.length === 1) {
    const [point] = points;
    return `${shortName(point.country)} · ${point.year}`;
  }

  const examples = points
    .slice(0, 2)
    .map((point) => `${shortName(point.country)} · ${point.year}`)
    .join(' · ');

  const remaining = points.length - 2;

  return remaining > 0
    ? `${examples} · +${remaining} more`
    : examples;
}

  function cellColor(value) {
    if (!Number.isFinite(value)) {
      return 'rgba(255, 255, 255, 0.04)';
    }

    if (value <= -15) {
      return '#463d9f';
    }

    if (value <= -8) {
      return '#596cc4';
    }

    if (value < -2) {
      return '#668fcd';
    }

    if (value <= 2) {
      return '#52708e';
    }

    if (value < 8) {
      return '#3a9bb9';
    }

    if (value < 15) {
      return '#43c4d8';
    }

    return '#79eff5';
  }

  function cellOpacity(value) {
    if (!Number.isFinite(value)) {
      return 0.25;
    }

    return 1;
  }

  function yearLabel(year, index) {
    return (
      index === 0 ||
      index === years.length - 1 ||
      Number(year) % 5 === 0
    );
  }

  function legendColor(index) {
    const colors = [
      '#463d9f',
      '#596cc4',
      '#668fcd',
      '#52708e',
      '#3a9bb9',
      '#43c4d8',
      '#79eff5'
    ];

    return colors[index];
  }
</script>

<section class="sea-level-viz">
  {#if loading}
    <p class="status">Loading sea-level data...</p>
  {:else if error}
    <p class="status error">{error}</p>
  {:else if countries.length}
    <div class="chart-card">
      <p class="eyebrow">Sea-level anomalies</p>

      <div class="heading-row">
        <div>
          <h3>The ocean has a pulse.</h3>

          <p class="intro">
            Each cell is one annual sea-level anomaly. Reading across a row
            shows how conditions changed at one location; reading down a column
            shows how the Pacific moved in the same year.
          </p>
        </div>

        <span class="period">
          {years[0]}–{years[years.length - 1]}
        </span>
      </div>

      <div class="stats-row">
        <article class="stat-card stat-card--high">
          <span>Highest anomaly</span>

          <strong>{formatCardCentimetres(highestValue)}</strong>

          <p>{formatExtremeLocations(highestPoints)}</p>
        </article>

        <article class="stat-card stat-card--low">
          <span>Lowest anomaly</span>

          <strong>{formatCardCentimetres(lowestValue)}</strong>

          <p>{formatExtremeLocations(lowestPoints)}</p>
        </article>

        <article class="stat-card">
          <span>Latest regional average</span>

          <strong>{formatCentimetres(latestAverage)}</strong>

          <p>{latestYear} · available locations</p>
        </article>
      </div>

      <div class="heatmap-scroll">
        <svg
          class="heatmap"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="Annual sea-level anomalies across Pacific Island countries and territories"
        >
          {#each years as year, yearIndex}
            {#if yearLabel(year, yearIndex)}
              <text
                class="year-label"
                x={cellX(yearIndex) + cellWidth / 2}
                y={chartHeight - 16}
                text-anchor="middle"
              >
                {year}
              </text>
            {/if}
          {/each}

          {#each countries as country, countryIndex}
            <text
              class="country-label"
              x={margin.left - 12}
              y={cellY(countryIndex) + rowHeight / 2 + 4}
              text-anchor="end"
            >
              {shortName(country.name)}
            </text>

            {#each years as year, yearIndex}
              {@const value = country.values[year]}

              <rect
                class="heat-cell"
                x={cellX(yearIndex) + 1}
                y={cellY(countryIndex) + 2}
                width={Math.max(cellWidth - 2, 1)}
                height={rowHeight - 4}
                rx="3"
                fill={cellColor(value)}
                opacity={cellOpacity(value)}
              >
                <title>
                  {country.name}, {year}: {formatCentimetres(value)}
                </title>
              </rect>
            {/each}
          {/each}
        </svg>
      </div>

      <div class="legend">
        <span class="legend-title">Below reference</span>

        <div class="legend-scale" aria-hidden="true">
          {#each Array(7) as _, index}
            <span style={`background: ${legendColor(index)};`}></span>
          {/each}
        </div>

        <span class="legend-title">Above reference</span>
      </div>

      <p class="note">
        Values are annual sea-level anomalies relative to the dataset reference
        period, shown in centimetres. They show variation above or below the
        reference level, not cumulative sea-level rise.
      </p>
    </div>
  {:else}
    <p class="status">No sea-level data is available.</p>
  {/if}
</section>

<style>
  .sea-level-viz {
    width: 100%;
  }

  .chart-card {
    padding: clamp(1.25rem, 3vw, 2rem);
    border: 1px solid rgba(141, 187, 255, 0.24);
    border-radius: 18px;
    background:
      linear-gradient(
        145deg,
        rgba(17, 46, 82, 0.96),
        rgba(6, 20, 39, 0.96)
      );
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.18);
  }

  .eyebrow {
    margin: 0 0 0.85rem;
    color: #8fc2ff;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .heading-row {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
  }

  h3 {
    max-width: 20ch;
    margin: 0;
    color: #ffffff;
    font-size: clamp(1.65rem, 3vw, 2.7rem);
    letter-spacing: -0.045em;
    line-height: 1.02;
  }

  .intro {
    max-width: 710px;
    margin: 1rem 0 0;
    color: #a9c8e5;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .period {
    height: fit-content;
    padding: 0.55rem 0.75rem;
    border: 1px solid rgba(141, 187, 255, 0.25);
    border-radius: 999px;
    color: #9bb5d6;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
    margin: 1.75rem 0;
  }

  .stat-card {
    min-height: 122px;
    padding: 1rem;
    border: 1px solid rgba(141, 187, 255, 0.14);
    border-radius: 12px;
    background: rgba(6, 25, 48, 0.52);
  }

  .stat-card--high {
    border-color: rgba(94, 231, 255, 0.32);
  }

  .stat-card--low {
    border-color: rgba(135, 127, 255, 0.36);
  }

  .stat-card span {
    display: block;
    color: #89a5c5;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .stat-card strong {
    display: block;
    margin-top: 0.7rem;
    color: #ffffff;
    font-size: clamp(1.4rem, 2vw, 1.9rem);
    line-height: 1;
  }

  .stat-card--high strong {
    color: #5ee7ff;
  }

  .stat-card--low strong {
    color: #aaa4ff;
  }

  .stat-card p {
    margin: 0.75rem 0 0;
    color: #a9c8e5;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .heatmap-scroll {
    width: 100%;
    overflow-x: auto;
  }

  .heatmap {
    display: block;
    width: 100%;
    min-width: 820px;
    height: auto;
  }

  .heat-cell {
    stroke: rgba(5, 20, 38, 0.55);
    stroke-width: 1;
    transform-box: fill-box;
    transform-origin: center;
    transition:
      opacity 150ms ease,
      transform 150ms ease,
      stroke 150ms ease;
  }

  .heat-cell:hover {
    cursor: pointer;
    opacity: 1;
    stroke: #ffffff;
    transform: scale(1.12);
  }

  .country-label,
  .year-label {
    fill: #b8cee4;
    font-size: 12px;
  }

  .year-label {
    fill: #89a5c5;
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-top: 1.35rem;
    color: #9bb5d6;
    font-size: 0.78rem;
  }

  .legend-title {
    white-space: nowrap;
  }

  .legend-scale {
    display: grid;
    grid-template-columns: repeat(7, 22px);
    gap: 3px;
  }

  .legend-scale span {
    display: block;
    width: 22px;
    height: 12px;
    border-radius: 3px;
  }

  .note {
    max-width: 840px;
    margin: 1.5rem 0 0;
    color: #89a5c5;
    font-size: 0.78rem;
    line-height: 1.55;
  }

  .status {
    margin: 0;
    color: #9bb5d6;
  }

  .error {
    color: #ff9d9d;
  }

  @media (max-width: 760px) {
    .heading-row {
      display: block;
    }

    .period {
      display: inline-block;
      margin-top: 1rem;
    }

    .stats-row {
      grid-template-columns: 1fr;
    }

    .legend {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }
</style>