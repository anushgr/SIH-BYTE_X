"use client"

import { useEffect, useMemo, useState } from "react"
export default function InfoPage() {
  const stateToUrl: Record<string, string> = useMemo(() => ({
    "Andhra Pradesh": "https://irrigation.ap.gov.in/",
    "Arunachal Pradesh": "https://wrdarunachal.nic.in/",
    "Assam": "https://waterresources.assam.gov.in/",
    "Bihar": "https://wrd.bihar.gov.in/",
    "Chhattisgarh": "https://wrid.cg.gov.in/",
    "Delhi": "https://djb.gov.in/",
    "Goa": "https://goawrd.gov.in/schemes-policies/rain-water-harvesting",
    "Gujarat": "https://guj-nwrws.gujarat.gov.in/",
    "Haryana": "https://www.harrws.nic.in/",
    "Himachal Pradesh": "https://hpiph.org/",
    "Jammu & Kashmir": "https://jalshakti.jk.gov.in/",
    "Jharkhand": "https://wrdjharkhand.nic.in/",
    "Karnataka": "https://waterresources.karnataka.gov.in/",
    "Kerala": "https://waterresources.kerala.gov.in/",
    "Madhya Pradesh": "https://www.mpwrd.gov.in/",
    "Maharashtra": "https://wrd.maharashtra.gov.in/",
    "Manipur": "https://manipur.gov.in/",
    "Meghalaya": "https://megdams.gov.in/",
    "Mizoram": "https://irrigation.mizoram.gov.in/",
    "Nagaland": "https://nagaland.gov.in/",
    "Odisha": "https://www.dowrodisha.gov.in/",
    "Punjab": "https://irrigation.punjab.gov.in/",
    "Rajasthan": "https://waterresources.rajasthan.gov.in/",
    "Sikkim": "https://sikkim.gov.in/",
    "Tamil Nadu": "https://www.tn.gov.in/department/22",
    "Telangana": "https://irrigation.telangana.gov.in/",
    "Tripura": "https://wrtripura.nic.in/",
    "Uttar Pradesh": "https://irrigation.up.nic.in/",
    "Uttarakhand": "https://www.uk.gov.in/",
    "West Bengal": "https://wbiwd.gov.in/",
    "Andaman & Nicobar Islands": "https://andaman.gov.in/",
    "Chandigarh": "https://chandigarh.gov.in/",
    "Puducherry": "https://pwd.py.gov.in/",
  }), [])

  const [selectedState, setSelectedState] = useState<string>("")
  const selectedUrl = selectedState ? stateToUrl[selectedState] : ""
  const selectedHost = useMemo(() => {
    if (!selectedUrl) return ""
    try { return new URL(selectedUrl).hostname } catch { return selectedUrl }
  }, [selectedUrl])

  // Re-apply translations for newly mounted elements when a state is selected
  useEffect(() => {
    if (!selectedUrl) return
    try {
      const lang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'en'
      // small delay to ensure the elements are in the DOM
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lang-changed', { detail: { lang } }))
      }, 0)
    } catch {}
  }, [selectedUrl])

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Rainwater Harvesting in India</h1>
        <p className="text-muted-foreground">
          Rooftop Rainwater Harvesting (RTRWH) and Artificial Recharge (AR) are recommended by the Central Ground Water Board (CGWB) to conserve water and replenish aquifers. This page explains practical methods, benefits, requirements, and FAQs to help you get started.
        </p>
      </header>

      <section className="space-y-6 mb-12">
        <h2 className="text-2xl font-semibold">Key Benefits</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Groundwater recharge and improved water security</li>
          <li>Reduced dependence on tanker/municipal supply and lower bills</li>
          <li>Urban flood mitigation and reduced stormwater run-off</li>
          <li>Better water quality in wells due to dilution and recharge</li>
          <li>Supports climate resilience and sustainable water management</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Common Methods (RTRWH and Artificial Recharge)</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-lg border p-4">
            <h3 className="text-xl font-semibold mb-2">Rooftop to Storage Tank</h3>
            <p className="mb-3">Convey roof run-off via gutters and downpipes to a screened filter and store in an above/underground tank for non-potable uses (flushing, gardening, cleaning). Add disinfection for potable use.</p>
            <img
              src="/images/rwh/rooftop_rainwater.jpg"
              alt="Rooftop rainwater harvesting storage tank"
              className="block w-full h-56 object-contain rounded"
              loading="lazy"
            />
          </article>

          <article className="rounded-lg border p-4 pb-3">
            <h3 className="text-xl font-semibold mb-2">Rooftop to Recharge Pit</h3>
            <p className="mb-3">Divert filtered roof water to a recharge pit filled with pebbles/sand/gravel to enhance percolation and recharge shallow aquifers.</p>
            <img
              src="/images/rwh/recharge_pit.jpg"
              alt="Recharge pit for roof water"
              className="block w-full h-56 object-contain rounded"
              loading="lazy"
            />
          </article>

          <article className="rounded-lg border p-4">
            <h3 className="text-xl font-semibold mb-2">Recharge Trench</h3>
            <p className="mb-3">Linear trench backfilled with coarse media to intercept runoff from paved areas or multiple downpipes. Suitable for limited space along plot boundaries.</p>
            <img
              src="/images/rwh/recharge_trench.jpg"
              alt="Recharge trench for rainwater"
              className="w-full h-56 object-cover rounded"
              loading="lazy"
            />
          </article>

          <article className="rounded-lg border p-4">
            <h3 className="text-xl font-semibold mb-2">Recharge Well / Shaft</h3>
            <p className="mb-3">A deep bored shaft or existing defunct well used to convey filtered water to deeper aquifers through a silt trap and screen assembly.</p>
            <img
              src="/images/rwh/borewell_recharge.jpeg"
              alt="Recharge well used for artificial recharge"
              className="w-full h-56 object-cover rounded"
              loading="lazy"
            />
          </article>

          <article className="rounded-lg border p-4">
            <h3 className="text-xl font-semibold mb-2">Percolation Pond/Tank</h3>
            <p className="mb-3">Small pond constructed to store stormwater and enhance percolation. Effective in campuses, layouts, and peri-urban areas.</p>
            <img
              src="/images/rwh/percolation_lake.jpg"
              alt="Percolation tank used for groundwater recharge"
              className="w-full h-56 object-cover rounded"
              loading="lazy"
            />
          </article>

          <article className="rounded-lg border p-4">
            <h3 className="text-xl font-semibold mb-2">Traditional Systems (Regional)</h3>
            <p className="mb-3">Johads, Baolis/Stepwells, Tankas, Kuls/Guls, Khadins, Virdas, Ahar-Pyne etc. remain context-appropriate in many regions and inspire modern designs.</p>
            <img
              src="/images/rwh/stepwell.jpg"
              alt="Traditional stepwell (baori) in Rajasthan"
              className="w-full h-56 object-cover rounded"
              loading="lazy"
            />
          </article>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">General Requirements</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Clean roof catchment and secure gutters/downpipes sized for local peak rainfall</li>
          <li>First-flush diverter to discard initial dirty runoff; leaf/debris screens</li>
          <li>Multi-stage filtration (coarse → fine media) before storage/recharge</li>
          <li>Safe overflow routing to drains or recharge features</li>
          <li>Storage tank with access hatch, mosquito-proof vent, and isolation valves</li>
          <li>For recharge: silt trap, inspection chamber, and graded media in pits/trenches</li>
          <li>Backflow prevention and labeling to avoid cross-connection with potable lines</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">Planning, Sizing, and Approvals</h2>
        <p className="mb-2">Sizing depends on roof area, runoff coefficient, and local annual rainfall. Our assessment tool estimates RTRWH and AR dimensions based on your inputs.</p>
        <p className="mb-2">Many states/ULBs mandate rainwater harvesting in building bye-laws. Consult local development authority/municipal guidelines and CGWB advisories before construction.</p>
      </section>

      <section className="mb-12 rounded-xl border shadow-sm bg-muted/30">
        <div className="p-6">
          <h2 className="text-3xl font-semibold mb-3"><span data-translate="State-specific Government Links">State-specific Government Links</span></h2>
          <p className="mb-5 text-muted-foreground"><span data-translate="Select your state to visit the official water resources or related government portal. Look for rainwater harvesting guidelines, mandates, and application procedures on the destination site.">Select your state to visit the official water resources or related government portal. Look for rainwater harvesting guidelines, mandates, and application procedures on the destination site.</span></p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="state" className="sm:w-64 font-medium"><span data-translate="Choose State">Choose State</span></label>
            <select
              id="state"
              className="w-full sm:max-w-md rounded-md border-2 bg-background p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
            <option value="">Select a state</option>
              {Object.keys(stateToUrl).sort().map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {selectedUrl && (
            <div className="mt-5 flex flex-col gap-2">
              <a
                href={selectedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <span className="opacity-90" data-translate="Open:">Open:</span>
                <span className="font-semibold">{selectedHost}</span>
              </a>
              <p className="text-xs text-muted-foreground"><span data-translate="Note: Pages may be in English or the respective state language. Use site search for 'Rainwater Harvesting' or 'RTRWH'.">Note: Pages may be in English or the respective state language. Use site search for 'Rainwater Harvesting' or 'RTRWH'.</span></p>
            </div>
          )}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">Operation and Maintenance</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Pre-monsoon cleaning of roof, gutters, filters; service first-flush device</li>
          <li>Quarterly inspection of tanks, screens, recharge pits, and silt traps</li>
          <li>Desilt recharge pits/trenches annually or as needed</li>
          <li>Disinfect stored water if used for potable purposes; test quality periodically</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold">Is rainwater safe for drinking?</h3>
            <p>Yes, with appropriate filtration and disinfection. For most homes, prioritize non-potable uses and follow BIS/health guidance for potable use.</p>
          </div>
          <div>
            <h3 className="font-semibold">How much can my roof harvest?</h3>
            <p>Annual harvest ≈ Roof area × Annual rainfall × Runoff coefficient. The app auto-estimates using local rainfall and your roof details.</p>
          </div>
          <div>
            <h3 className="font-semibold">Is rainwater harvesting mandatory?</h3>
            <p>Many states and cities mandate RWH in building bye-laws for new or large plots. Check your local ULB/authority.</p>
          </div>
          <div>
            <h3 className="font-semibold">What maintenance is required?</h3>
            <p>Regular cleaning of catchments, filters, and inspection of storage/recharge structures, especially before the monsoon.</p>
          </div>
          <div>
            <h3 className="font-semibold">Can I retrofit RWH to existing buildings?</h3>
            <p>Yes. Downpipes can be connected to a filter and either a storage tank or a recharge structure depending on your goal and space.</p>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-semibold mb-2">References and Further Reading</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Central Ground Water Board (CGWB):
            {" "}
            <a className="text-blue-600 underline" href="https://cgwb.gov.in" target="_blank" rel="noreferrer">cgwb.gov.in</a>
          </li>
          <li>
            Ministry of Jal Shakti (Department of Water Resources, RD & GR):
            {" "}
            <a className="text-blue-600 underline" href="https://jalshakti-dowr.gov.in" target="_blank" rel="noreferrer">jalshakti-dowr.gov.in</a>
          </li>
          <li>
            India Water Portal: Rainwater Harvesting FAQs and case studies
          </li>
        </ul>
      </section>
    </main>
  )
}


