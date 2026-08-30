<script>
  import { onMount } from 'svelte';
  import { dsvFormat } from 'd3-dsv';

  let countries = [];
  let loading = true;
  let error = '';
  let showAll = false;

  $: visibleCountries = showAll ? countries : countries.slice(0, 10);
  $: maxValue = countries[0]?.total ?? 1;

  onMount(async () => {
    try {
      const response = await fetch('/data/people_disasters.csv');
      if (!response.ok) throw new Error('Nie udało się wczytać pliku people_disasters.csv.');

      const text = await response.text();
      const firstLine = text.split(/\r?\n/)[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';
      const rows = dsvFormat(delimiter).parse(text);

      const aggregateRows = new Set([
        'Melanesia',
        'Micronesia',
        'Polynesia',
        'Pacific Island Countries and territories'
      ]);

      countries = rows
        .map((row) => ({
          name: String(row.Country ?? '').trim(),
          total: parseValue(row.SUM)
        }))
        .filter((row) => row.name && !aggregateRows.has(row.name) && row.total > 0)
        .sort((a, b) => b.total - a.total);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function parseValue(value) {
    if (value === undefined || value === null) return 0;

    const normalized = String(value)
      .replace(/\s/g, '')
      .replace(/\*/g, '')
      .replace(/,/g, '.')
      .trim();

    if (!normalized || normalized.toUpperCase() === 'NULL') return 0;

    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
  }

  function width(value) {
    return `${Math.max(2, (value / maxValue) * 100)}%`;
  }
</script>

<div class="viz">
  <div class="glow"></div>

  <div class="content">
    <p class="label">Pacific overview</p>

    <h2>Years of disruption</h2>

    <p class="text">
      Cumulative reported number of people directly affected by disasters between 2005 and 2023.
    </p>

    {#if loading}
      <p class="status">Loading data...</p>
    {:else if error}
      <p class="status error">{error}</p>
    {:else}
      <div class="ranking-header">
        <span>Reported affected persons</span>
        <button type="button" on:click={() => (showAll = !showAll)}>
          {showAll ? 'Top 10' : 'All countries'}
        </button>
      </div>

      <div class="bars">
        {#each visibleCountries as country, index}
          <div class="bar-row">
            <div class="country-name">
              <span class="rank">{index + 1}</span>
              <span title={country.name}>{country.name}</span>
            </div>

            <div class="bar-track">
              <div class="bar" style={`width:${width(country.total)}`}></div>
            </div>

            <div class="value">{formatNumber(country.total)}</div>
          </div>
        {/each}
      </div>

      <p class="note">
        Sum of reported annual values.
      </p>
    {/if}
  </div>
</div>

<style>
  .viz {
    position: relative;
    min-height: 520px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 28px;
    background:
      radial-gradient(circle at 20% 20%, rgba(109, 188, 255, 0.22), transparent 30%),
      radial-gradient(circle at 80% 30%, rgba(83, 140, 255, 0.18), transparent 28%),
      linear-gradient(180deg, rgba(10, 28, 49, 0.98), rgba(4, 10, 20, 1));
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  }

  .glow {
    position: absolute;
    inset: -20%;
    background: radial-gradient(circle, rgba(135, 205, 255, 0.16), transparent 55%);
    filter: blur(24px);
    animation: drift 10s ease-in-out infinite alternate;
  }

  .content {
    position: relative;
    z-index: 1;
    min-height: 520px;
    padding: 2rem;
  }

  .label {
    margin: 0;
    color: #9cc7ff;
    font-size: 0.75rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0.5rem 0 0;
    color: #fff;
    font-size: clamp(1.8rem, 4vw, 3rem);
  }

  .text {
    max-width: 52ch;
    margin: 0.75rem 0 2rem;
    color: #c8d7ec;
    line-height: 1.6;
  }

  .ranking-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #9bb5d6;
    font-size: 0.8rem;
  }

  button {
    padding: 0.55rem 0.8rem;
    border: 1px solid rgba(141, 187, 255, 0.35);
    border-radius: 8px;
    background: #10233f;
    color: #d8e7f7;
    cursor: pointer;
    font: inherit;
    font-size: 0.75rem;
  }

  button:hover {
    border-color: #8dbbff;
    background: #173456;
  }

  .bars {
    display: grid;
    gap: 0.8rem;
  }

  .bar-row {
    display: grid;
    grid-template-columns: 180px minmax(100px, 1fr) 90px;
    align-items: center;
    gap: 0.7rem;
  }

  .country-name {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
    color: #dce9f7;
    font-size: 0.76rem;
  }

  .country-name > span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank {
    width: 1.1rem;
    color: #6f91b8;
    font-size: 0.7rem;
    text-align: right;
  }

  .bar-track {
    height: 12px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(141, 187, 255, 0.09);
  }

  .bar {
    height: 100%;
    min-width: 3px;
    border-radius: inherit;
    background: linear-gradient(90deg, #4c97b9, #78a8ff);
  }

  .value {
    color: #d8e7f7;
    font-size: 0.75rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .note,
  .status {
    margin: 1.25rem 0 0;
    color: #9bb5d6;
    font-size: 0.72rem;
  }

  .error {
    color: #ff9d9d;
  }

  @keyframes drift {
    from { transform: translate3d(-1%, -1%, 0) scale(1); }
    to { transform: translate3d(2%, 1%, 0) scale(1.06); }
  }

  @media (max-width: 900px) {
    .viz { min-height: 380px; }
    .content { min-height: 380px; }
  }

  @media (max-width: 620px) {
    .bar-row {
      grid-template-columns: 125px minmax(60px, 1fr) 70px;
      gap: 0.45rem;
    }

    .country-name,
    .value {
      font-size: 0.68rem;
    }
  }
</style>
