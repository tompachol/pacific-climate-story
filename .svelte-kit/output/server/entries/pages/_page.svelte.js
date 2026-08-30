import { a6 as attr_style, a7 as bind_props, a8 as fallback, a9 as ensure_array_like, aa as attr, ab as attr_class, a4 as head } from "../../chunks/index.js";
import "clsx";
import { scaleSequential, interpolateYlOrRd, format } from "d3";
function PacificVisuals($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let heroFade, isOverview;
    let mode = fallback($$props["mode"], "hero");
    let heroPaths = [];
    let heroLoading = mode === "hero";
    let scrollY = 0;
    let mapVisible = false;
    heroFade = Math.max(0, 1 - scrollY / 500);
    isOverview = mode === "overview";
    if (mode === "hero") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<section class="hero-map svelte-6kthks"${attr_style("", {
        opacity: heroFade,
        transform: `translateY(${-scrollY * 0.08}px)`
      })}><div class="glow svelte-6kthks"></div> `);
      if (heroLoading) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="status svelte-6kthks">Loading Pacific...</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<svg viewBox="0 0 620 480" role="img" aria-label="Pacific island cluster" class="svelte-6kthks"><!--[-->`);
        const each_array = ensure_array_like(heroPaths);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let path = each_array[$$index];
          $$renderer2.push(`<path${attr("d", path)} class="svelte-6kthks"></path>`);
        }
        $$renderer2.push(`<!--]--></svg> <span class="label svelte-6kthks">PACIFIC ISLANDS</span>`);
      }
      $$renderer2.push(`<!--]--></section>`);
    } else if (mode === "map" || mode === "overview") {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<section${attr_class("risk-map-section svelte-6kthks", void 0, { "visible": mapVisible, "overview": isOverview })}><div class="map-wrap svelte-6kthks">`);
      if (isOverview) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="overview-label svelte-6kthks">PACIFIC OCEAN</div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="legend svelte-6kthks"><p class="legend-title svelte-6kthks">Risk level</p> <div class="legend-item svelte-6kthks"><span class="dot very-high svelte-6kthks"></span> Very high risk</div> <div class="legend-item svelte-6kthks"><span class="dot high svelte-6kthks"></span> High risk</div></div>`);
      }
      $$renderer2.push(`<!--]--></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { mode });
  });
}
function PacificClimateMap($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let countriesWithExposure;
    scaleSequential(interpolateYlOrRd).domain([0, 100]);
    format(".0f");
    format(",");
    let countries = [];
    countriesWithExposure = countries.filter(({ coastalExposure }) => Number.isFinite(coastalExposure));
    countriesWithExposure.length ? countriesWithExposure.reduce((highest, country) => country.coastalExposure > highest.coastalExposure ? country : highest) : null;
    countriesWithExposure.length ? countriesWithExposure.reduce((lowest, country) => country.coastalExposure < lowest.coastalExposure ? country : lowest) : null;
    countriesWithExposure.length ? countriesWithExposure.reduce((sum, { coastalExposure }) => sum + coastalExposure, 0) / countriesWithExposure.length : null;
    [...countriesWithExposure].sort((a, b) => b.coastalExposure - a.coastalExposure).slice(0, 6);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="state svelte-guhyic">Loading coastal exposure map...</div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function SeaLevelViz($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let allPoints, highestValue, lowestValue, latestYear, latestValues;
    let years = [];
    let countries = [];
    allPoints = countries.flatMap((country) => years.map((year) => ({ country: country.name, year, value: country.values[year] })).filter((point) => Number.isFinite(point.value)));
    highestValue = allPoints.length ? Math.max(...allPoints.map((point) => point.value)) : null;
    lowestValue = allPoints.length ? Math.min(...allPoints.map((point) => point.value)) : null;
    highestValue === null ? [] : allPoints.filter((point) => point.value === highestValue);
    lowestValue === null ? [] : allPoints.filter((point) => point.value === lowestValue);
    latestYear = years[years.length - 1] ?? "";
    latestValues = countries.map((country) => ({ name: country.name, value: country.values[latestYear] })).filter((item) => Number.isFinite(item.value));
    latestValues.length ? latestValues.reduce((sum, item) => sum + item.value, 0) / latestValues.length : null;
    $$renderer2.push(`<section class="sea-level-viz svelte-x5w2fw">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="status svelte-x5w2fw">Loading sea-level data...</p>`);
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
function DisasterImpactViz($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let featuredCountries;
    let years = [];
    let countries = [];
    const featuredCount = 4;
    featuredCountries = countries.slice(0, featuredCount);
    featuredCountries.length ? Math.max(...featuredCountries.flatMap((country) => years.map((year) => country.values[year] ?? 0))) : 1;
    featuredCountries.find((country) => country.name === "Fiji")?.values?.["2016"] ? {
      index: years.indexOf("2016"),
      value: featuredCountries.find((country) => country.name === "Fiji").values["2016"]
    } : null;
    $$renderer2.push(`<section class="disaster-viz svelte-1vdpof6">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="status svelte-1vdpof6">Loading disaster data...</p>`);
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
function RenewableEnergyViz($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let visibleCountries, plotHeight, barGap;
    let countries = [];
    const chartHeight = 560;
    const margin = { top: 32, bottom: 42 };
    visibleCountries = [...countries].filter((country) => Number.isFinite(country.value)).sort((a, b) => b.value - a.value);
    plotHeight = chartHeight - margin.top - margin.bottom;
    barGap = 14;
    visibleCountries.length ? Math.min(30, Math.max(18, (plotHeight - barGap * (visibleCountries.length - 1)) / visibleCountries.length)) : 0;
    $$renderer2.push(`<section class="renewable-viz svelte-ys81l2">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="status svelte-ys81l2">Loading renewable energy data...</p>`);
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
function _page($$renderer) {
  head("1uha8ag", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>On the Edge of Disappearing</title>`);
    });
    $$renderer2.push(`<meta name="description" content="An interactive data story about climate exposure and resilience in Pacific Island countries." class="svelte-1uha8ag"/>`);
  });
  $$renderer.push(`<main class="page svelte-1uha8ag"><section class="hero svelte-1uha8ag" aria-labelledby="hero-title"><div class="hero-inner svelte-1uha8ag"><p class="eyebrow hero-eyebrow svelte-1uha8ag">Pacific Dataviz Challenge 2026</p> <h1 id="hero-title" class="hero-title svelte-1uha8ag">On the edge of disappearing</h1> <p class="lead hero-lead svelte-1uha8ag">Pacific Island countries are among the first places where climate change
        is already visible.</p> <p class="scroll-hint hero-hint svelte-1uha8ag">Scroll down to follow the story.</p></div> <div class="hero-visual hero-visual-enter svelte-1uha8ag" aria-label="Pacific Islands visualisation">`);
  PacificVisuals($$renderer, { mode: "hero" });
  $$renderer.push(`<!----></div></section> <section class="story-section story-section--dark story-section--chart section-enter svelte-1uha8ag" aria-labelledby="sea-level-title"><div class="story-copy svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">01 / The ocean is changing</p> <h2 id="sea-level-title" class="svelte-1uha8ag">The first warning sign is in the water.</h2> <p class="svelte-1uha8ag">Sea-level anomalies reveal how the ocean surrounding Pacific Island
        countries is changing over time. What appears gradual on a chart can
        change the baseline for coastal flooding, erosion and saltwater
        intrusion.</p> <p class="story-highlight svelte-1uha8ag">For low-lying islands, centimetres matter.</p></div> <div class="visual-container svelte-1uha8ag">`);
  SeaLevelViz($$renderer);
  $$renderer.push(`<!----></div></section> <section class="story-section story-section--light story-section--map section-enter svelte-1uha8ag"><div class="map-container svelte-1uha8ag">`);
  PacificClimateMap($$renderer);
  $$renderer.push(`<!----></div></section> <section class="story-section story-section--dark story-section--impact section-enter svelte-1uha8ag" aria-labelledby="impact-title"><div class="story-copy svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">03 / Human impact</p> <h2 id="impact-title" class="svelte-1uha8ag">Disaster impacts arrive in visible peaks.</h2> <p class="svelte-1uha8ag">Reported impacts vary sharply between years and locations. A missing or
        zero value does not necessarily mean that nobody was affected; it may
        also reflect limited or incomplete reporting.</p> <p class="story-note svelte-1uha8ag">The chart shows reported disaster impacts, not the full human cost of
        every event.</p></div> <div class="visual-container svelte-1uha8ag">`);
  DisasterImpactViz($$renderer);
  $$renderer.push(`<!----></div></section> <section class="story-section story-section--light story-section--resilience section-enter svelte-1uha8ag" aria-labelledby="resilience-title"><div class="story-copy svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">04 / Resilience</p> <h2 id="resilience-title" class="svelte-1uha8ag">The future is not only about risk. It is about choices.</h2> <p class="svelte-1uha8ag">Renewable energy is not the whole resilience story. It is one measurable
        choice that can reduce dependence on fossil fuels and reshape the
        region’s energy future.</p> <p class="story-note svelte-1uha8ag">Energy choices show one practical dimension of climate resilience.</p></div> <div class="visual-container svelte-1uha8ag">`);
  RenewableEnergyViz($$renderer);
  $$renderer.push(`<!----></div></section> <section class="closing-section section-enter svelte-1uha8ag" aria-labelledby="closing-title"><div class="closing-copy svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">The takeaway</p> <h2 id="closing-title" class="svelte-1uha8ag">A changing ocean connects every part of island life.</h2> <p class="svelte-1uha8ag">Sea-level rise is not only an environmental trend. It is a growing
        challenge for homes, infrastructure, livelihoods and long-term
        resilience across the Pacific.</p> <div class="methods svelte-1uha8ag"><h3 class="svelte-1uha8ag">Data and methods</h3> <div class="methods-grid svelte-1uha8ag"><article class="svelte-1uha8ag"><h4 class="svelte-1uha8ag">Sea-level anomalies</h4> <p class="svelte-1uha8ag">Annual values relative to the dataset reference period.</p></article> <article class="svelte-1uha8ag"><h4 class="svelte-1uha8ag">Coastal exposure</h4> <p class="svelte-1uha8ag">Share of population living in the low-elevation coastal zone,
              within 0–10 metres above sea level.</p></article> <article class="svelte-1uha8ag"><h4 class="svelte-1uha8ag">Disaster impacts</h4> <p class="svelte-1uha8ag">Reported people directly affected by disasters. Missing or zero
              values should not automatically be interpreted as no impact.</p></article> <article class="svelte-1uha8ag"><h4 class="svelte-1uha8ag">Renewable energy</h4> <p class="svelte-1uha8ag">Share of total final energy consumption derived from renewable
              sources.</p></article></div> <p class="source-note svelte-1uha8ag">Data sources: Pacific Data Hub, United Nations Sustainable Development
          Goals Indicators and official Pacific Dataviz Challenge datasets.</p></div></div></section> <footer class="footer svelte-1uha8ag"><p class="svelte-1uha8ag">Built by Tomasz Pacholski for Pacific Dataviz Challenge 2026.</p> <p class="svelte-1uha8ag">On the Edge of Disappearing — an interactive Pacific climate data story.</p></footer></main>`);
}
export {
  _page as default
};
