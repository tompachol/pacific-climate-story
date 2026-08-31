<script>
  import { onMount } from 'svelte';
  import { dsvFormat } from 'd3-dsv';

  let countries = [];
  let latestYear = '';
  let loading = true;
  let error = '';

  const chartWidth = 1000;
  const chartHeight = 560;
  const margin = { top: 32, right: 90, bottom: 42, left: 230 };

  $: visibleCountries = [...countries]
    .filter((country) => Number.isFinite(country.value))
    .sort((a, b) => b.value - a.value);

  $: plotWidth = chartWidth - margin.left - margin.right;
  $: plotHeight = chartHeight - margin.top - margin.bottom;

  $: barGap = 14;

  $: barHeight = visibleCountries.length
    ? Math.min(
        30,
        Math.max(
          18,
          (plotHeight - barGap * (visibleCountries.length - 1)) /
            visibleCountries.length
        )
      )
    : 0;

  onMount(loadData);

  async function loadData() {
    try {
      const response = await fetch('/data/renewable_energy.csv');

      if (!response.ok) {
        throw new Error(
          'Could not load renewable_energy.csv. Check that the file is located in static/data.'
        );
      }

      const text = await response.text();
      const firstLine = text.split(/\r?\n/)[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';
      const rows = dsvFormat(delimiter).parse(text);

      if (!rows.length) {
        throw new Error('The CSV file does not contain data.');
      }

      const countryColumn = findColumn(rows, [
        'country',
        'Country',
        'location',
        'Location',
        'Entity',
        'Pacific Island Countries and territories'
      ]);

      const yearColumn = findColumn(rows, [
        'year',
        'Year',
        'time',
        'Time'
      ]);

      const valueColumn = findColumn(rows, [
        'value',
        'Value',
        'OBS_VALUE',
        'Observation value'
      ]);

      if (!countryColumn || !yearColumn || !valueColumn) {
        throw new Error(
          `Missing columns. Found columns: ${Object.keys(rows[0]).join(', ')}`
        );
      }

      const cleanRows = rows
        .map((row) => ({
          country: String(row[countryColumn] ?? '').trim(),
          year: Number(String(row[yearColumn] ?? '').trim()),
          value: parseValue(row[valueColumn])
        }))
        .filter(
          (row) =>
            row.country &&
            Number.isFinite(row.year) &&
            Number.isFinite(row.value)
        );

      if (!cleanRows.length) {
        throw new Error(
          'No valid observations found. Expected columns: country, year, value.'
        );
      }

      latestYear = Math.max(...cleanRows.map((row) => row.year));

      /*
        For each country, select its latest available observation.
        This prevents a country from disappearing when it has no value
        in the latest year shared by the whole dataset.
      */
      const latestByCountry = new Map();

      for (const row of cleanRows) {
        const previous = latestByCountry.get(row.country);

        if (!previous || row.year > previous.year) {
          latestByCountry.set(row.country, row);
        }
      }

      countries = [...latestByCountry.values()].map((row) => ({
        country: row.country,
        year: row.year,
        value: row.value
      }));
    } catch (err) {
      console.error(err);
      error = err instanceof Error ? err.message : 'Unexpected error.';
    } finally {
      loading = false;
    }
  }

  function findColumn(rows, possibleNames) {
    const columns = Object.keys(rows[0]);

    return (
      possibleNames.find((name) => columns.includes(name)) ??
      columns.find((column) =>
        possibleNames.some(
          (name) => column.toLowerCase() === name.toLowerCase()
        )
      )
    );
  }

  function parseValue(value) {
    if (value === undefined || value === null) {
      return null;
    }

    const text = String(value).trim();

    if (!text) {
      return null;
    }

    let normalized = text
      .replace(/\*/g, '')
      .replace(/%/g, '')
      .replace(/\s/g, '');

    /*
      The source stores values directly as percentages on a 0–100 scale:
      50,06 -> 50.06%
      0,69  -> 0.69%
      1.234,56 -> 1234.56
    */
    if (normalized.includes(',') && normalized.includes('.')) {
      normalized = normalized
        .replace(/\./g, '')
        .replace(',', '.');
    } else if (normalized.includes(',')) {
      normalized = normalized.replace(',', '.');
    }

    const number = Number(normalized);

    return Number.isFinite(number) ? number : null;
  }

  function y(index) {
    return margin.top + index * (barHeight + barGap);
  }

  function barWidth(value) {
    return (value / 100) * plotWidth;
  }

  function formatPercentage(value) {
    return `${value.toFixed(1)}%`;
  }

  function displayName(country) {
    const names = {
      'Micronesia, Federated States of': 'Micronesia',
      'Micronesia (Federated States of)': 'Micronesia',
      'Federated States of Micronesia': 'Micronesia',
      'Marshall Islands': 'Marshall Is.',
      'Solomon Islands': 'Solomon Is.',
      'Papua New Guinea': 'Papua New Guinea'
    };

    return names[country] ?? country;
  }
</script>

<section class="renewable-viz">
  {#if loading}
    <p class="status">Loading renewable energy data...</p>
  {:else if error}
    <p class="status error">{error}</p>
  {:else if visibleCountries.length}
    <div class="chart-card">
      <p class="eyebrow">Renewable energy share</p>

      <div class="heading-row">
        <div>
          <h3>Energy choices shape resilience.</h3>

          <p class="intro">
            Renewable energy is one practical indicator of the region’s energy
            transition. The chart shows the latest available value for each
            country, rather than forcing every country into the same year.
          </p>
        </div>

        <span class="period">Latest available values</span>
      </div>

      <p class="chart-insight">
        The highest available share is recorded by
        <strong>{displayName(visibleCountries[0].country)}</strong>:
        <strong>{formatPercentage(visibleCountries[0].value)}</strong>
        ({visibleCountries[0].year}).
      </p>

      <div class="chart-scroll">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="Latest available renewable energy share by Pacific country"
        >
          {#each [0, 25, 50, 75, 100] as tick}
            <line
              class="grid-line"
              x1={margin.left + (tick / 100) * plotWidth}
              x2={margin.left + (tick / 100) * plotWidth}
              y1={margin.top - 6}
              y2={margin.top + plotHeight}
            />

            <text
              class="axis-label"
              x={margin.left + (tick / 100) * plotWidth}
              y={margin.top - 14}
              text-anchor="middle"
            >
              {tick}%
            </text>
          {/each}

          {#each visibleCountries as country, index}
            {@const currentY = y(index)}
            {@const currentWidth = barWidth(country.value)}

            <text
              class="country-label"
              x={margin.left - 16}
              y={currentY + barHeight / 2 + 4}
              text-anchor="end"
            >
              {displayName(country.country)}
            </text>

            <rect
              class="bar-background"
              x={margin.left}
              y={currentY}
              width={plotWidth}
              height={barHeight}
              rx="5"
            />

            <rect
              class="bar"
              class:bar-primary={index === 0}
              x={margin.left}
              y={currentY}
              width={currentWidth}
              height={barHeight}
              rx="5"
            />

            <text
              class="bar-value"
              x={Math.min(
                margin.left + currentWidth + 10,
                chartWidth - margin.right
              )}
              y={currentY + barHeight / 2 + 4}
              text-anchor={
                margin.left + currentWidth + 10 > chartWidth - margin.right
                  ? 'end'
                  : 'start'
              }
            >
              {formatPercentage(country.value)}
            </text>

            <text
              class="year-label"
              x={chartWidth - margin.right + 12}
              y={currentY + barHeight / 2 + 4}
            >
              {country.year}
            </text>
          {/each}
        </svg>
      </div>

      <div class="chart-footer">
        <span>
          Share of final energy consumption derived from renewable sources.
        </span>

        <span class="unit">Percentage · latest value per country</span>
      </div>

      <p class="note">
        Countries may have different latest available years. Renewable-energy
        share is one indicator of energy transition and does not represent a
        complete measure of climate resilience.
      </p>
    </div>
  {:else}
    <p class="status">No renewable energy values are available.</p>
  {/if}
</section>

<style>
  .renewable-viz {
    width: 100%;
  }

  .chart-card {
    width: 100%;
    padding: clamp(1.25rem, 3vw, 2rem);
    border: 1px solid rgba(39, 124, 179, 0.24);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.42);
    box-shadow: 0 18px 50px rgba(18, 61, 91, 0.12);
  }

  .eyebrow {
    margin: 0 0 0.85rem;
    color: #277cb3;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .heading-row {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 2rem;
  }

  h3 {
    max-width: 20ch;
    margin: 0;
    color: #09233f;
    font-size: clamp(1.65rem, 3vw, 2.7rem);
    letter-spacing: -0.045em;
    line-height: 1.02;
  }

  .intro {
    max-width: 720px;
    margin: 1rem 0 0;
    color: #31516b;
    font-size: 0.95rem;
    line-height: 1.65;
  }

  .period {
    flex: 0 0 auto;
    padding: 0.55rem 0.75rem;
    border: 1px solid rgba(39, 124, 179, 0.25);
    border-radius: 999px;
    color: #277cb3;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .chart-insight {
    margin: 1.35rem 0 1.7rem;
    color: #31516b;
    font-size: 0.96rem;
    line-height: 1.55;
  }

  .chart-insight strong {
    color: #277cb3;
  }

  .chart-scroll {
    overflow-x: auto;
  }

  svg {
    display: block;
    width: 100%;
    min-width: 820px;
    height: auto;
    overflow: visible;
  }

  .grid-line {
    stroke: rgba(39, 124, 179, 0.17);
  }

  .axis-label {
    fill: #55748b;
    font-size: 12px;
  }

  .country-label {
    fill: #31516b;
    font-size: 13px;
  }

  .year-label {
    fill: #55748b;
    font-size: 12px;
  }

  .bar-background {
    fill: rgba(39, 124, 179, 0.1);
  }

  .bar {
    fill: #70bdd3;
    cursor: default;
    transform-box: fill-box;
    transform-origin: left center;
    transition:
      opacity 160ms ease,
      filter 160ms ease,
      transform 160ms ease;
  }

  .bar:hover {
    opacity: 0.88;
    filter: brightness(1.08);
    transform: scaleY(1.12);
  }

  .bar-primary {
    fill: #277cb3;
  }

  .bar-value {
    fill: #09233f;
    font-size: 13px;
    font-weight: 700;
  }

  .chart-footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.25rem;
    color: #55748b;
    font-size: 0.78rem;
    line-height: 1.5;
  }

  .unit {
    flex: 0 0 auto;
    text-align: right;
  }

  .note {
    max-width: 820px;
    margin: 1rem 0 0;
    color: #55748b;
    font-size: 0.78rem;
    line-height: 1.55;
  }

  .status {
    margin: 0;
    color: #55748b;
  }

  .error {
    color: #b33d32;
  }

  @media (max-width: 700px) {
    .heading-row {
      display: block;
    }

    .period {
      display: inline-block;
      margin-top: 1rem;
    }

    .chart-footer {
      flex-direction: column;
    }

    .unit {
      text-align: left;
    }
  }
</style>
