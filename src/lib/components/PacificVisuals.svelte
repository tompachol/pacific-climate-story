<script>
  import { onMount } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import { geoCentroid, geoMercator, geoPath } from 'd3-geo';
  import { pacificIslands } from '$lib/data/pacificIslands';

  export let mode = 'hero';

  let heroPaths = [];
  let heroLoading = mode === 'hero';
  let heroError = '';
  let scrollY = 0;
  let mapContainer;
  let mapVisible = false;

  $: heroFade = Math.max(0, 1 - scrollY / 500);
  $: isRiskMap = mode === 'map';
  $: isOverview = mode === 'overview';

  onMount(async () => {
    if (mode === 'hero') {
      try {
        const response = await fetch('/data/pacific-islands-light.geojson');
        if (!response.ok) throw new Error('Nie udało się wczytać pliku GeoJSON.');

        const geojson = await response.json();
        const features = geojson.features
          .filter((feature) => {
            try {
              const [longitude, latitude] = geoCentroid(feature);
              return longitude >= 155 && longitude <= 180 && latitude >= -25 && latitude <= 10;
            } catch {
              return false;
            }
          })
          .slice(0, 12);

        if (!features.length) {
          throw new Error('Nie znaleziono wysp w wybranym regionie Pacyfiku.');
        }

        const selectedGeojson = {
          type: 'FeatureCollection',
          features
        };

        const projection = geoMercator().fitSize([620, 480], selectedGeojson);
        const pathGenerator = geoPath(projection);
        heroPaths = features.map((feature) => pathGenerator(feature)).filter(Boolean);
      } catch (error) {
        heroError = error.message;
      } finally {
        heroLoading = false;
      }

      return;
    }

    if (!mapContainer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        mapVisible = entry.isIntersecting;
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(mapContainer);

    const L = await import('leaflet');
    const leafletMap = L.map(mapContainer, {
      center: isOverview ? [10, 165] : [-10, 180],
      zoom: isOverview ? 1 : 3,
      minZoom: isOverview ? 1 : 2,
      maxZoom: isOverview ? 1 : 8,
      zoomControl: isRiskMap,
      dragging: isRiskMap,
      scrollWheelZoom: false,
      doubleClickZoom: isRiskMap,
      boxZoom: false,
      keyboard: isRiskMap,
      touchZoom: isRiskMap,
      attributionControl: isRiskMap
    });

    if (isOverview) {
      leafletMap.setView([8, 165], 1);
    }

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      noWrap: true
    }).addTo(leafletMap);

    if (isRiskMap) {
      pacificIslands.forEach((island) => {
        L.circleMarker([island.lat, island.lng], {
          radius: island.risk === 'very high' ? 9 : 7,
          color: island.color,
          fillColor: island.color,
          fillOpacity: 0.9,
          weight: 2
        })
          .addTo(leafletMap)
          .bindPopup(
            `<strong>${island.name}</strong><br>${island.note}<br><em>Risk: ${island.risk}</em>`
          );
      });
    }

    if (isOverview) {
      pacificIslands.forEach((island) => {
        L.circleMarker([island.lat, island.lng], {
          radius: 2.5,
          color: '#d9f4ff',
          fillColor: '#8bd3dd',
          fillOpacity: 0.9,
          weight: 1,
          interactive: false
        }).addTo(leafletMap);
      });

      L.rectangle(
        [
          [-25, 155],
          [10, 180]
        ],
        {
          color: '#8dbbff',
          weight: 1,
          opacity: 0.85,
          fill: false,
          dashArray: '3 4',
          interactive: false
        }
      ).addTo(leafletMap);
    }

    setTimeout(() => leafletMap.invalidateSize(), 0);

    return () => {
      observer.disconnect();
      leafletMap.remove();
    };
  });
</script>

<svelte:window bind:scrollY />

{#if mode === 'hero'}
  <section
    class="hero-map"
    style:opacity={heroFade}
    style:transform={`translateY(${-scrollY * 0.08}px)`}
  >
    <div class="glow"></div>

    {#if heroLoading}
      <span class="status">Loading Pacific...</span>
    {:else if heroError}
      <span class="status error">{heroError}</span>
    {:else}
      <svg viewBox="0 0 620 480" role="img" aria-label="Pacific island cluster">
        {#each heroPaths as path}
          <path d={path}></path>
        {/each}
      </svg>

      <span class="label">PACIFIC ISLANDS</span>
    {/if}
  </section>
{:else if mode === 'map' || mode === 'overview'}
  <section class:visible={mapVisible} class:overview={isOverview} class="risk-map-section">
    <div class="map-wrap" bind:this={mapContainer}>
      {#if isOverview}
        <div class="overview-label">PACIFIC OCEAN</div>
      {:else}
        <div class="legend">
          <p class="legend-title">Risk level</p>

          <div class="legend-item">
            <span class="dot very-high"></span>
            Very high risk
          </div>

          <div class="legend-item">
            <span class="dot high"></span>
            High risk
          </div>
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .hero-map {
    position: relative;
    width: min(100%, 620px);
    aspect-ratio: 620 / 480;
  }

  .glow {
    position: absolute;
    inset: 10%;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(84, 153, 212, 0.24),
      rgba(84, 153, 212, 0.1) 35%,
      transparent 72%
    );
    filter: blur(24px);
  }

  svg {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  path {
    fill: rgba(141, 187, 255, 0.12);
    stroke: rgba(214, 236, 255, 0.95);
    stroke-width: 1.3;
    vector-effect: non-scaling-stroke;
    filter: drop-shadow(0 0 6px rgba(141, 187, 255, 0.22));
  }

  .label,
  .status {
    position: absolute;
    right: 2%;
    bottom: 5%;
    z-index: 2;
    color: #8dbbff;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .status {
    right: 50%;
    bottom: 50%;
    transform: translate(50%, 50%);
    white-space: nowrap;
  }

  .error {
    color: #ff9d9d;
    letter-spacing: normal;
    text-transform: none;
  }

  .risk-map-section {
    position: relative;
    width: 100%;
    min-height: 520px;
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .risk-map-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .map-wrap {
    position: relative;
    width: 100%;
    height: 520px;
    overflow: hidden;
    border-radius: 28px;
  }

  .overview.risk-map-section {
    width: 100%;
    height: 100%;
    min-height: 0;
    opacity: 1;
    transform: none;
  }

  .overview .map-wrap {
    height: 100%;
    border-radius: 0;
  }

  .overview-label {
    position: absolute;
    top: 0.55rem;
    left: 0.65rem;
    z-index: 500;
    color: rgba(220, 240, 255, 0.8);
    font-size: 0.58rem;
    letter-spacing: 0.14em;
    pointer-events: none;
  }

  .overview :global(.leaflet-control-zoom),
  .overview :global(.leaflet-control-attribution) {
    display: none;
  }

  .overview :global(.leaflet-tile-pane) {
    opacity: 0.8;
  }

  .legend {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    z-index: 500;
    min-width: 160px;
    padding: 0.9rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: rgba(5, 10, 18, 0.82);
    backdrop-filter: blur(10px);
    color: #eaf2ff;
  }

  .legend-title {
    margin: 0 0 0.7rem;
    color: #9cc7ff;
    font-size: 0.8rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.45rem;
    font-size: 0.92rem;
  }

  .dot {
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
    border-radius: 999px;
  }

  .very-high {
    background: #ff7b7b;
  }

  .high {
    background: #ffb36b;
  }
</style>
