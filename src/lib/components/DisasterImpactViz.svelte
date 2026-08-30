<script>
  import { onMount } from 'svelte';
  import { dsvFormat } from 'd3-dsv';

  let years = [];
  let countries = [];
  let loading = true;
  let error = '';
  let chartIsVisible = false;

  const featuredCount = 4;

  const chartWidth = 1000;
  const chartHeight = 430;
  const margin = { top: 30, right: 40, bottom: 52, left: 78 };

  const colors = ['#5ee7ff', '#8dbbff', '#9d8cff', '#72cdb1'];

  $: featuredCountries = countries.slice(0, featuredCount);

  $: plotWidth = chartWidth - margin.left - margin.right;
  $: plotHeight = chartHeight - margin.top - margin.bottom;

  $: maxValue = featuredCountries.length
    ? Math.max(
        ...featuredCountries.flatMap((country) =>
          years.map((year) => country.values[year] ?? 0)
        )
      )
    : 1;

  $: yMax = roundUp(maxValue);
  $: yTicks = [0, yMax / 2, yMax];

  $: winstonPoint = featuredCountries
    .find((country) => country.name === 'Fiji')
    ?.values?.['2016']
    ? {
        index: years.indexOf('2016'),
        value: featuredCountries.find((country) => country.name === 'Fiji')
          .values['2016']
      }
    : null;

  onMount(async () => {
    try {
      const response = await fetch('/data/people_disasters.csv');

      if (!response.ok) {
        throw new Error('Could not load people_disasters.csv.');
      }

      const text = await response.text();
      const delimiter = text.split(/\r?\n/)[0].includes(';') ? ';' : ',';
      const rows = dsvFormat(delimiter).parse(text);

      years = Object.keys(rows[0])
        .filter((key) => /^\d{4}$/.test(key))
        .sort();

      countries = rows
        .map((row) => {
          const name = row.Country || row.country || row.Location || row.Entity;

          const values = Object.fromEntries(
            years.map((year) => [year, parseValue(row[year])])
          );

          const total = Object.values(values).reduce(
            (sum, value) => sum + (value > 0 ? value : 0),
            0
          );

          return { name, values, total };
        })
        .filter((country) => country.name && country.total > 0)
        .sort((a, b) => b.total - a.total);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unexpected error.';
    } finally {
      loading = false;
    }
  });

  function animateWhenVisible(node) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          chartIsVisible = true;
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -80px 0px'
      }
    );

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      }
    };
  }

  function parseValue(value) {
    if (value === undefined || value === null) {
      return null;
    }

    const text = String(value).trim();

    if (!text) {
      return null;
    }

    const clean = text
      .replace(/\s/g, '')
      .replace(/,/g, '')
      .replace('*', '');

    const number = Number(clean);

    return Number.isFinite(number) ? number : null;
  }

  function roundUp(value) {
    if (!value || value <= 0) {
      return 100;
    }

    const magnitude = 10 ** Math.floor(Math.log10(value));

    return Math.ceil(value / magnitude) * magnitude;
  }

  function x(index) {
    if (years.length <= 1) {
      return margin.left;
    }

    return margin.left + (index / (years.length - 1)) * plotWidth;
  }

  function y(value) {
    return margin.top + plotHeight - (value / yMax) * plotHeight;
  }

  function linePath(country) {
    const points = years
      .map((year, index) => ({
        index,
        year,
        value: country.values[year]
      }))
      .filter((point) => point.value > 0);

    return points
      .map((point, index) => {
        const command = index === 0 ? 'M' : 'L';

        return `${command} ${x(point.index)} ${y(point.value)}`;
      })
      .join(' ');
  }

  function pointsFor(country) {
    return years
      .map((year, index) => ({
        index,
        year,
        value: country.values[year]
      }))
      .filter((point) => point.value > 0);
  }

  function formatValue(value) {
    return new Intl.NumberFormat('en-US').format(value);
  }

  function shortName(name) {
    const names = {
      'Micronesia, Federated States of': 'Micronesia',
      'Marshall Islands': 'Marshall Is.',
      'Solomon Islands': 'Solomon Is.'
    };

    return names[name] ?? name;
  }

  function showYear(year, index) {
    return index === 0 || index === years.length - 1 || Number(year) % 5 === 0;
  }
</script>

<section class="disaster-viz">
  {#if loading}
    <p class="status">Loading disaster data...</p>
  {:else if error}
    <p class="status error">{error}</p>
  {:else}
    <div class="chart-card" use:animateWhenVisible>
      <p class="eyebrow">Reported people directly affected</p>

      <div class="heading-row">
        <div>
          <h3>Reported impacts arrive in sharp peaks.</h3>

          <p class="intro">
            Each line shows reported people directly affected by disasters. The
            2016 Fiji peak coincides with Tropical Cyclone Winston, a Category
            5 event that affected hundreds of thousands of people. Years
            without a positive value are not treated as proof that nobody was
            affected.
          </p>
        </div>

        <span class="period">{years[0]}–{years[years.length - 1]}</span>
      </div>

      <div class="chart-scroll">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="Annual reported disaster impacts across four Pacific countries"
        >
          {#each yTicks as tick}
            <line
              class="grid"
              x1={margin.left}
              x2={chartWidth - margin.right}
              y1={y(tick)}
              y2={y(tick)}
            />

            <text
              class="axis"
              x={margin.left - 12}
              y={y(tick) + 4}
              text-anchor="end"
            >
              {formatValue(tick)}
            </text>
          {/each}

          {#each years as year, index}
            {#if showYear(year, index)}
              <text
                class="axis"
                x={x(index)}
                y={chartHeight - 16}
                text-anchor="middle"
              >
                {year}
              </text>
            {/if}
          {/each}

          {#each featuredCountries as country, index}
            <path
              class="line"
              class:line-draw={chartIsVisible}
              d={linePath(country)}
              stroke={colors[index]}
              style={`animation-delay: ${index * 180}ms;`}
            />

            {#each pointsFor(country) as point}
              <circle
                class:point-enter={chartIsVisible}
                cx={x(point.index)}
                cy={y(point.value)}
                r="4"
                fill={colors[index]}
                style={`animation-delay: ${900 + index * 180}ms;`}
              >
                <title>
                  {country.name}, {point.year}: {formatValue(point.value)}
                  people directly affected
                </title>
              </circle>
            {/each}
          {/each}

          {#if winstonPoint && winstonPoint.index >= 0}
            <line
              class="winston-marker"
              class:winston-enter={chartIsVisible}
              x1={x(winstonPoint.index)}
              x2={x(winstonPoint.index)}
              y1={margin.top}
              y2={y(winstonPoint.value)}
            />

            <circle
              class="winston-point"
              class:winston-enter={chartIsVisible}
              cx={x(winstonPoint.index)}
              cy={y(winstonPoint.value)}
              r="7"
            />

            <rect
              class="winston-box"
              class:winston-enter={chartIsVisible}
              x={x(winstonPoint.index) - 115}
              y="10"
              width="230"
              height="48"
              rx="10"
            />

            <text
              class="winston-label"
              class:winston-enter={chartIsVisible}
              x={x(winstonPoint.index)}
              y="29"
              text-anchor="middle"
            >
              2016 · Fiji · {formatValue(winstonPoint.value)}
            </text>

            <text
              class="winston-subtitle"
              class:winston-enter={chartIsVisible}
              x={x(winstonPoint.index)}
              y="46"
              text-anchor="middle"
            >
              Tropical Cyclone Winston
            </text>
          {/if}
        </svg>
      </div>

      <div class="legend">
        {#each featuredCountries as country, index}
          <div class="legend-item">
            <span
              class="legend-line"
              style={`background: ${colors[index]};`}
            ></span>

            <span>{shortName(country.name)}</span>
          </div>
        {/each}
      </div>

      <p class="note">
        Points show years with a positive reported value. Lines connect reported
        observations to make the timing of reported impacts easier to follow.
        Missing or zero values may reflect no reported impact or incomplete
        reporting.
      </p>
    </div>
  {/if}
</section>

<style>
  .disaster-viz {
    width: 100%;
  }

  .chart-card {
    padding: clamp(1.25rem, 3vw, 2rem);
    border: 1px solid rgba(141, 187, 255, 0.24);
    border-radius: 18px;
    background: linear-gradient(
      145deg,
      rgba(17, 46, 82, 0.96),
      rgba(6, 20, 39, 0.96)
    );
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
    max-width: 680px;
    margin: 1rem 0 1.5rem;
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

  .chart-scroll {
    overflow-x: auto;
  }

  svg {
    display: block;
    width: 100%;
    min-width: 760px;
    height: auto;
  }

  .grid {
    stroke: rgba(155, 181, 214, 0.18);
  }

  .axis {
    fill: #93b1d2;
    font-size: 12px;
  }

  .line {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3.5;
    stroke-dasharray: 1800;
    stroke-dashoffset: 1800;
  }

  .line-draw {
    animation: draw-line 1100ms ease-out forwards;
  }

  @keyframes draw-line {
    to {
      stroke-dashoffset: 0;
    }
  }

  circle {
    stroke: #07111f;
    stroke-width: 1.5;
  }

  .chart-card circle:not(.winston-point) {
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
    transform: scale(0);
  }

  .point-enter {
    animation: point-enter 300ms ease-out forwards;
  }

  @keyframes point-enter {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .winston-marker,
  .winston-point,
  .winston-box,
  .winston-label,
  .winston-subtitle {
    opacity: 0;
  }

  .winston-enter {
    animation: winston-enter 400ms ease-out 1500ms forwards;
  }

  @keyframes winston-enter {
    to {
      opacity: 1;
    }
  }

  .winston-marker {
    stroke: rgba(94, 231, 255, 0.58);
    stroke-width: 1.3;
    stroke-dasharray: 5 5;
  }

  .winston-point {
    fill: #ffffff;
    stroke: #5ee7ff;
    stroke-width: 3;
    filter: drop-shadow(0 0 8px rgba(94, 231, 255, 0.7));
  }

  .winston-box {
    fill: rgba(4, 22, 43, 0.96);
    stroke: rgba(94, 231, 255, 0.55);
    stroke-width: 1;
  }

  .winston-label {
    fill: #5ee7ff;
    font-size: 12px;
    font-weight: 700;
  }

  .winston-subtitle {
    fill: #b8d4e9;
    font-size: 11px;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem 1.5rem;
    margin-top: 1.25rem;
    color: #d8e7f7;
    font-size: 0.85rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-line {
    width: 22px;
    height: 3px;
    border-radius: 999px;
  }

  .note {
    margin: 1.5rem 0 0;
    color: #89a5c5;
    font-size: 0.78rem;
    line-height: 1.5;
  }

  .status {
    margin: 0;
    color: #9bb5d6;
  }

  .error {
    color: #ff9d9d;
  }

  @media (max-width: 700px) {
    .heading-row {
      display: block;
    }

    .period {
      display: inline-block;
      margin-top: 1rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .line {
      stroke-dasharray: none;
      stroke-dashoffset: 0;
    }

    .line-draw,
    .point-enter,
    .winston-enter {
      animation: none;
    }

    .chart-card circle:not(.winston-point),
    .winston-marker,
    .winston-point,
    .winston-box,
    .winston-label,
    .winston-subtitle {
      opacity: 1;
      transform: none;
    }
  }
</style>