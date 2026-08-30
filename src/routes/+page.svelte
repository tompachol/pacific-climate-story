<script lang="ts">
  import PacificVisuals from '../lib/components/PacificVisuals.svelte';
  import PacificClimateMap from '../lib/components/PacificClimateMap.svelte';
  import SeaLevelViz from '../lib/components/SeaLevelViz.svelte';
  import DisasterImpactViz from '../lib/components/DisasterImpactViz.svelte';
  import RenewableEnergyViz from '../lib/components/RenewableEnergyViz.svelte';
</script>

<svelte:head>
  <title>On the Edge of Disappearing</title>

  <meta
    name="description"
    content="An interactive data story about climate exposure and resilience in Pacific Island countries."
  />
</svelte:head>

<main class="page">
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-inner">
      <p class="eyebrow hero-eyebrow">
        Pacific Dataviz Challenge 2026
      </p>

      <h1 id="hero-title" class="hero-title">
        On the edge of disappearing
      </h1>

      <p class="lead hero-lead">
        Pacific Island countries are among the first places where climate change
        is already visible.
      </p>

      <p class="scroll-hint hero-hint">
        Scroll down to follow the story.
      </p>
    </div>

    <div
      class="hero-visual hero-visual-enter"
      aria-label="Pacific Islands visualisation"
    >
      <PacificVisuals mode="hero" />
    </div>
  </section>

  <section
    class="story-section story-section--dark story-section--chart section-enter"
    aria-labelledby="sea-level-title"
  >
    <div class="story-copy">
      <p class="eyebrow">01 / The ocean is changing</p>

      <h2 id="sea-level-title">
        The first warning sign is in the water.
      </h2>

      <p>
        Sea-level anomalies reveal how the ocean surrounding Pacific Island
        countries is changing over time. What appears gradual on a chart can
        change the baseline for coastal flooding, erosion and saltwater
        intrusion.
      </p>

      <p class="story-highlight">
        For low-lying islands, centimetres matter.
      </p>
    </div>

    <div class="visual-container">
      <SeaLevelViz />
    </div>
  </section>

  <section
    class="story-section story-section--light story-section--map section-enter"
  >
    <div class="map-container">
      <PacificClimateMap />
    </div>
  </section>

  <section
    class="story-section story-section--dark story-section--impact section-enter"
    aria-labelledby="impact-title"
  >
    <div class="story-copy">
      <p class="eyebrow">03 / Human impact</p>

      <h2 id="impact-title">
        Disaster impacts arrive in visible peaks.
      </h2>

      <p>
        Reported impacts vary sharply between years and locations. A missing or
        zero value does not necessarily mean that nobody was affected; it may
        also reflect limited or incomplete reporting.
      </p>

      <p class="story-note">
        The chart shows reported disaster impacts, not the full human cost of
        every event.
      </p>
    </div>

    <div class="visual-container">
      <DisasterImpactViz />
    </div>
  </section>

  <section
    class="story-section story-section--light story-section--resilience section-enter"
    aria-labelledby="resilience-title"
  >
    <div class="story-copy">
      <p class="eyebrow">04 / Resilience</p>

      <h2 id="resilience-title">
        The future is not only about risk. It is about choices.
      </h2>

      <p>
        Renewable energy is not the whole resilience story. It is one measurable
        choice that can reduce dependence on fossil fuels and reshape the
        region’s energy future.
      </p>

      <p class="story-note">
        Energy choices show one practical dimension of climate resilience.
      </p>
    </div>

    <div class="visual-container">
      <RenewableEnergyViz />
    </div>
  </section>

  <section
    class="closing-section section-enter"
    aria-labelledby="closing-title"
  >
    <div class="closing-copy">
      <p class="eyebrow">The takeaway</p>

      <h2 id="closing-title">
        A changing ocean connects every part of island life.
      </h2>

      <p>
        Sea-level rise is not only an environmental trend. It is a growing
        challenge for homes, infrastructure, livelihoods and long-term
        resilience across the Pacific.
      </p>

      <div class="methods">
        <h3>Data and methods</h3>

        <div class="methods-grid">
          <article>
            <h4>Sea-level anomalies</h4>

            <p>
              Annual values relative to the dataset reference period.
            </p>
          </article>

          <article>
            <h4>Coastal exposure</h4>

            <p>
              Share of population living in the low-elevation coastal zone,
              within 0–10 metres above sea level.
            </p>
          </article>

          <article>
            <h4>Disaster impacts</h4>

            <p>
              Reported people directly affected by disasters. Missing or zero
              values should not automatically be interpreted as no impact.
            </p>
          </article>

          <article>
            <h4>Renewable energy</h4>

            <p>
              Share of total final energy consumption derived from renewable
              sources.
            </p>
          </article>
        </div>

        <p class="source-note">
          Data sources: Pacific Data Hub, United Nations Sustainable Development
          Goals Indicators and official Pacific Dataviz Challenge datasets.
        </p>
      </div>
    </div>
  </section>

  <footer class="footer">
    <p>Built by Tomasz Pacholski for Pacific Dataviz Challenge 2026.</p>

    <p>
      On the Edge of Disappearing — an interactive Pacific climate data story.
    </p>
  </footer>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    min-width: 320px;
    margin: 0;
    overflow-x: hidden;
    color: #f5f9ff;
    background: #06192f;
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .page {
    width: 100%;
    overflow: hidden;
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: center;
    gap: clamp(2rem, 7vw, 6rem);
    width: min(100%, 1440px);
    min-height: 100vh;
    margin: 0 auto;
    padding: clamp(2rem, 6vw, 5rem);
  }

  .hero-inner,
  .story-copy,
  .closing-copy {
    width: 100%;
    max-width: 680px;
  }

  .hero-visual {
    width: 100%;
    min-width: 0;
    height: min(70vh, 680px);
  }

  .eyebrow {
    margin: 0 0 1rem;
    color: #8fc2ff;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  h1,
  h2 {
    margin: 0;
    letter-spacing: -0.055em;
  }

  h1 {
    max-width: 9ch;
    color: #ffffff;
    font-size: clamp(3rem, 8vw, 6.6rem);
    line-height: 0.94;
  }

  h2 {
    max-width: 13ch;
    font-size: clamp(2.4rem, 5vw, 4.8rem);
    line-height: 1;
  }

  .lead,
  .story-copy > p:not(.eyebrow),
  .closing-copy > p:not(.eyebrow),
  .source-note {
    line-height: 1.75;
  }

  .lead {
    max-width: 650px;
    margin: 1.5rem 0 0;
    color: #c7d8eb;
    font-size: 1.15rem;
  }

  .scroll-hint {
    margin: 2rem 0 0;
    color: #8fc2ff;
    font-size: 0.95rem;
    animation: hint-pulse 2.4s ease-in-out infinite;
  }

  @keyframes hint-pulse {
    0%,
    100% {
      opacity: 0.45;
      transform: translateY(0);
    }

    50% {
      opacity: 1;
      transform: translateY(5px);
    }
  }

  /*
    Hero: elementy pojawiają się w spokojnej kolejności.
    Nie stosujemy opacity: 0 bez animacji końcowej,
    więc treść zawsze pozostanie widoczna.
  */
  .hero-eyebrow {
    animation: hero-fade-up 600ms ease-out both;
  }

  .hero-title {
    animation: hero-fade-up 760ms 100ms ease-out both;
  }

  .hero-lead {
    animation: hero-fade-up 680ms 260ms ease-out both;
  }

  .hero-hint {
    animation:
      hero-fade-up 650ms 430ms ease-out both,
      hint-pulse 2.4s 1.1s ease-in-out infinite;
  }

  .hero-visual-enter {
    animation: hero-visual-fade 1000ms 220ms ease-out both;
  }

  @keyframes hero-fade-up {
    from {
      opacity: 0;
      transform: translateY(16px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes hero-visual-fade {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.985);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .story-section {
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(3rem, 6vw, 5rem);
    padding: clamp(6rem, 10vw, 9rem) max(1.25rem, calc((100vw - 1280px) / 2));
  }

  .story-copy {
    max-width: 780px;
  }

  .story-section--dark {
    color: #f5f9ff;
    background:
      radial-gradient(
        circle at 78% 50%,
        rgba(35, 113, 170, 0.18),
        transparent 27rem
      ),
      linear-gradient(135deg, #0d223d 0%, #07111f 58%, #040814 100%);
  }

  .story-section--dark .story-copy > p:not(.eyebrow) {
    color: #c7d8eb;
  }

  .story-section--light {
    color: #09233f;
    background:
      radial-gradient(
        circle at 85% 15%,
        rgba(82, 180, 205, 0.2),
        transparent 22rem
      ),
      #eaf4f6;
  }

  .story-section--light .eyebrow {
    color: #277cb3;
  }

  .story-section--light h2 {
    color: #09233f;
  }

  .story-section--light .story-copy > p:not(.eyebrow) {
    color: #31516b;
  }

  .visual-container,
  .map-container {
    width: 100%;
    min-width: 0;
  }

  .story-section--chart .visual-container {
    min-height: 520px;
  }

  .story-highlight {
    margin-top: 2rem !important;
    color: #8fc2ff !important;
    font-size: 1.05rem;
    font-weight: 700;
  }

  .story-section--map .map-container {
    min-height: min(70vh, 680px);
  }

  .story-note {
    margin-top: 2rem !important;
    color: #8fc2ff !important;
    font-size: 0.92rem;
    font-style: italic;
  }

  .story-section--light .story-note {
    color: #277cb3 !important;
  }

  /*
    Delikatne wejście sekcji przy pierwszym renderze.
    Sekcje NIE są ukrywane — opacity startuje od 0.88,
    dzięki czemu strona jest zawsze czytelna nawet,
    gdy przeglądarka ograniczy animacje.
  */
  .section-enter {
    animation: section-fade-in 720ms ease-out both;
  }

  @keyframes section-fade-in {
    from {
      opacity: 0.88;
      transform: translateY(8px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .story-section--chart {
    animation-delay: 120ms;
  }

  .story-section--map {
    animation-delay: 180ms;
  }

  .story-section--impact {
    animation-delay: 240ms;
  }

  .story-section--resilience {
    animation-delay: 300ms;
  }

  .closing-section {
    display: flex;
    align-items: center;
    min-height: 72vh;
    padding: clamp(5rem, 10vw, 9rem) max(1.25rem, calc((100vw - 1280px) / 2));
    color: #f5f9ff;
    background:
      radial-gradient(
        circle at 30% 50%,
        rgba(35, 113, 170, 0.24),
        transparent 30rem
      ),
      #06192f;
  }

  .closing-copy {
    max-width: 960px;
  }

  .closing-copy h2 {
    max-width: 15ch;
    color: #ffffff;
  }

  .closing-copy > p:not(.eyebrow) {
    max-width: 610px;
    margin-top: 1.75rem;
    color: #c7d8eb;
    font-size: 1.08rem;
  }

  .methods {
    margin-top: 3.5rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(143, 194, 255, 0.2);
  }

  .methods h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.2rem;
    letter-spacing: -0.02em;
  }

  .methods-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1.25rem;
  }

  .methods-grid article {
    padding: 1rem;
    border: 1px solid rgba(143, 194, 255, 0.16);
    border-radius: 12px;
    background: rgba(8, 30, 55, 0.45);
  }

  .methods-grid h4 {
    margin: 0;
    color: #8fc2ff;
    font-size: 0.9rem;
  }

  .methods-grid p {
    margin: 0.55rem 0 0;
    color: #b8c9d9;
    font-size: 0.8rem;
    line-height: 1.55;
  }

  .source-note {
    max-width: 800px;
    margin-top: 1.5rem !important;
    color: #89a5c5 !important;
    font-size: 0.82rem !important;
  }

  .footer {
    padding: 3rem 1.25rem;
    color: #89a5c5;
    background: #020b16;
    font-size: 0.85rem;
    line-height: 1.6;
    text-align: center;
  }

  .footer p {
    margin: 0.25rem 0;
  }

  @media (max-width: 900px) {
    .hero {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .hero-visual {
      height: 55vh;
      min-height: 320px;
    }

    .story-section--chart .visual-container,
    .story-section--map .map-container {
      min-height: 420px;
    }

    h1,
    h2 {
      max-width: none;
    }
  }

  @media (max-width: 700px) {
    .methods-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .hero,
    .story-section,
    .closing-section {
      padding-right: 1.25rem;
      padding-left: 1.25rem;
    }

    .hero {
      min-height: 760px;
    }

    .hero-visual {
      height: 380px;
      min-height: 0;
    }

    .story-section--chart .visual-container,
    .story-section--map .map-container {
      min-height: 320px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .scroll-hint,
    .hero-hint {
      animation: none;
    }

    .hero-eyebrow,
    .hero-title,
    .hero-lead,
    .hero-visual-enter,
    .section-enter {
      animation: none;
    }
  }
</style>