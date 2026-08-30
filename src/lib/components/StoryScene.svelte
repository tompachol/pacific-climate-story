<script>
  export let eyebrow = '';
  export let title = '';
  export let body = '';
  export let statistic = '';
  export let statisticLabel = '';
</script>

<section class="story-scene">
  <div class="scene-content">
    <p class="eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    <p class="body">{body}</p>
  </div>

  <div class="stat-card">
    <span class="statistic">{statistic}</span>
    <span class="statistic-label">{statisticLabel}</span>
  </div>
</section>

<style>
  .story-scene { min-height: 100vh; max-width: 1080px; margin: 0 auto; padding: 8rem 2rem; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(240px, .8fr); align-items: center; gap: 6rem; }
  .scene-content { max-width: 620px; }
  .eyebrow { margin: 0 0 1.2rem; color: #8dbbff; font-size: .75rem; text-transform: uppercase; letter-spacing: .18em; }
  h2 { margin: 0; color: #fff; font-size: clamp(2.8rem, 6vw, 5.8rem); line-height: .95; letter-spacing: -.06em; }
  .body { max-width: 540px; margin: 2rem 0 0; color: #c4d2e5; font-size: 1.1rem; line-height: 1.75; }
  .stat-card { padding: 2rem; border: 1px solid rgba(141,187,255,.28); border-radius: 1rem; background: rgba(17,39,70,.45); }
  .statistic { display: block; color: #fff; font-size: clamp(3rem, 7vw, 6rem); font-weight: 700; line-height: .95; }
  .statistic-label { display: block; margin-top: 1rem; color: #9bb5d6; font-size: .95rem; line-height: 1.5; }
  @media (max-width: 760px) { .story-scene { min-height: auto; grid-template-columns: 1fr; padding: 7rem 1.25rem; gap: 3rem; } }
</style>
