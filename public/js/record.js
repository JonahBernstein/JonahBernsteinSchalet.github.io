// 05 · the publication record as a stratigraphic column, youngest on top.
// Source: OpenAlex, author A5116630789 (ORCID 0009-0008-4998-8909), retrieved 2026-11-07.
(function () {
  const WORKS = [
    { y: 2026, kind: "preprint", t: "Enhanced rock weathering for improved smallholder farmer welfare: An at-scale case study for rice agriculture in India", v: "CDRxiv", a: "Jordan, Mills, Bernstein-Schalet, et al.", doi: "10.70212/cdrxiv.2026483.v1" },
    { y: 2026, kind: "preprint", t: "Increased yields for smallholder farmers from enhanced rock weathering", v: "CDRxiv", a: "Jordan, Mills, Jain, Patidar, Maji, Bernstein-Schalet, Agarwal, Planavsky", doi: "10.70212/cdrxiv.2026502.v1" },
    { y: 2026, kind: "dataset", t: "Increased yields for smallholder farmers from enhanced rock weathering — data", v: "Zenodo", a: "Jordan, Mills, Jain, Patidar, Maji, Bernstein-Schalet, Agarwal, Planavsky", doi: "10.5281/zenodo.20468069" },
    { y: 2026, kind: "dataset", t: "GPM Kharif 2024 — Health and Safety Dataset", v: "Zenodo", a: "Jordan, Bernstein-Schalet", doi: "10.5281/zenodo.19242236" },
    { y: 2026, kind: "abstract", t: "Balancing the Modern Uranium Budget in Bear Lake, Utah–Idaho", v: "Goldschmidt", a: "Piccione, Ibarra, Kinsley, et al.", doi: "10.46427/gold2026.37703" },
    { y: 2025, kind: "article", t: "Constraining the Modern Hydrological Balance of Bear Lake, Utah–Idaho: Insights From Stable Isotopes (δ¹⁸O and δ²H)", v: "Water Resources Research", a: "Custado, Gagnon, Belanger, Sekhon, Bernstein-Schalet, et al.", doi: "10.1029/2024wr038264" },
    { y: 2025, kind: "abstract", t: "Anionic resin as an MRV strategy for measuring DIC at ERW deployments", v: "Goldschmidt", a: "Das, Rajendran, Bernstein-Schalet, Agarwal, Jordan", doi: "10.7185/gold2025.27547" },
    { y: 2025, kind: "abstract", t: "Reactive-transport models and isotopic tracers reveal the spatial pattern of riverine CO₂ emissions and suggest cooperative inorganic–organic carbon cycling", v: "Goldschmidt", a: "Torres, Larsen, Suquino, et al.", doi: "10.7185/gold2025.28618" },
    { y: 2025, kind: "abstract", t: "Enhanced rock weathering for improved farmer welfare in the Global South: An at-scale case study for rice agriculture in India", v: "EGU General Assembly", a: "Jordan, Das, Bernstein-Schalet, Agarwal, Planavsky, Beerling", doi: "10.5194/egusphere-egu25-18512" },
    { y: 2024, kind: "abstract", t: "Wildfire impacts on soil chemistry and the role of pyrogenic carbon in soil mineral transformation", v: "GSA Abstracts with Programs", a: "Bernstein-Schalet, Muñoz, Ramos, et al.", doi: "10.1130/abs/2024ne-397725" },
    { y: 2024, kind: "abstract", t: "Insights into the hydrological balance of Bear Lake (Utah–Idaho) through stable water isotope analysis", v: "GSA Abstracts with Programs", a: "Custado, Gagnon, Belanger, Sekhon, Bernstein-Schalet, et al.", doi: "10.1130/abs/2024am-403368" },
  ];
  const LAYER = { 2026: "var(--label)", 2025: "var(--moss)", 2024: "var(--rust)" };
  const col = document.getElementById("column");
  let year = null;
  for (const w of WORKS) {
    if (w.y !== year) {
      year = w.y;
      const li = document.createElement("li");
      li.className = "year";
      li.style.setProperty("--layer", LAYER[year]);
      li.textContent = year;
      col.appendChild(li);
    }
    const li = document.createElement("li");
    li.className = "work";
    li.style.setProperty("--layer", LAYER[year]);
    li.innerHTML = `<a class="t" href="https://doi.org/${w.doi}" target="_blank" rel="noopener">${w.t}</a>
      <p class="m"><span class="kind">${w.kind}</span>${w.a} · <i>${w.v}</i></p>`;
    col.appendChild(li);
  }
})();
