<section class="statement" aria-labelledby="statement-title">
  <div class="statement-inner">
    <p class="eyebrow">1993–2023</p>

    <h2 id="statement-title">
      The ocean did not rise evenly.
    </h2>

    <div class="metric" aria-label="111 millimetres of global mean sea-level rise">
      <span class="metric-value">+111</span>
      <span class="metric-unit">mm</span>
    </div>

    <p class="description">
      Global mean sea level rose by around 111 millimetres between 1993 and
      2023. For low-lying Pacific islands, even small changes can increase
      exposure to flooding, erosion and saltwater intrusion.
    </p>

    <p class="source">
      Satellite-era global mean sea-level record, 1993–2023.
    </p>
  </div>
</section>

<style>
  .statement {
    min-height: 90vh;
    padding: clamp(5rem, 10vw, 9rem) clamp(1.25rem, 6vw, 5rem);
  }

  .statement-inner {
    width: min(100%, 1180px);
    margin: 0 auto;
  }

  .eyebrow {
    margin: 0 0 1rem;
    color: #8fc2ff;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  h2 {
    max-width: 10ch;
    margin: 0;
    color: #ffffff;
    font-size: clamp(2.8rem, 6vw, 6rem);
    line-height: 0.96;
    letter-spacing: -0.05em;
  }

  .metric {
    display: flex;
    align-items: baseline;
    gap: 0.65rem;
    margin-top: clamp(3rem, 7vw, 6rem);
  }

  .metric-value {
    color: #ffffff;
    font-size: clamp(5rem, 16vw, 13rem);
    font-weight: 750;
    line-height: 0.8;
    letter-spacing: -0.08em;
  }

  .metric-unit {
    color: #8fc2ff;
    font-size: clamp(1.5rem, 3vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .description {
    max-width: 620px;
    margin: 2rem 0 0;
    color: #c7d8eb;
    font-size: clamp(1rem, 1.7vw, 1.2rem);
    line-height: 1.75;
  }

  .source {
    margin: 2rem 0 0;
    color: #89a5c5;
    font-size: 0.8rem;
    line-height: 1.5;
  }

  @media (max-width: 600px) {
    .statement {
      min-height: 75vh;
    }

    h2 {
      max-width: 12ch;
    }
  }
</style>