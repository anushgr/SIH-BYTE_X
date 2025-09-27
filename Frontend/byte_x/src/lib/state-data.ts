export interface StateData {
  name: string
  officialWaterSite: string
}

export const STATE_URLS: Record<string, string> = {
  "Andhra Pradesh": "https://irrigation.ap.gov.in/",
  "Arunachal Pradesh": "https://wrdarunachal.nic.in/",
  "Assam": "https://waterresources.assam.gov.in/",
  "Bihar": "https://wrd.bihar.gov.in/",
  "Chhattisgarh": "https://www.cgwrd.in/",
  "Delhi": "https://djb.gov.in/",
  "Goa": "https://goawrd.gov.in/schemes-policies/rain-water-harvesting",
  "Gujarat": "https://guj-nwrws.gujarat.gov.in/",
  "Haryana": "https://hid.gov.in/",
  "Himachal Pradesh": "https://jsv.hp.nic.in/",
  "Jammu & Kashmir": "https://jalshakti.jk.gov.in/",
  "Jharkhand": "https://wrdjharkhand.nic.in/",
  "Karnataka": "https://waterresources.karnataka.gov.in/",
  "Kerala": "https://irrigation.kerala.gov.in/",
  "Madhya Pradesh": "https://www.mpwrd.gov.in/",
  "Maharashtra": "https://wrd.maharashtra.gov.in/",
  "Manipur": "https://wrd.mn.gov.in/en/",
  "Meghalaya": "https://megwaterresources.gov.in/",
  "Mizoram": "https://irrigation.mizoram.gov.in/",
  "Nagaland": "https://wrd.nagaland.gov.in/",
  "Odisha": "https://www.dowrodisha.gov.in/",
  "Punjab": "https://irrigation.punjab.gov.in/",
  "Rajasthan": "https://water.rajasthan.gov.in",
  "Sikkim": "https://sikkim-waterresources.gov.in/",
  "Tamil Nadu": "https://cmwssb.tn.gov.in/rain-water-harvesting",
  "Telangana": "https://www.telangana.gov.in/rain-water-harvesting-2/",
  "Tripura": "https://pwd.tripura.gov.in/",
  "Uttar Pradesh": "https://upgwdonline.in/",
  "Uttarakhand": "http://uttarakhandirrigation.com/",
  "West Bengal": "https://wbiwd.gov.in/",
  "Andaman & Nicobar Islands": "https://andaman.gov.in/",
  "Chandigarh": "https://chandigarh.gov.in/",
  "Puducherry": "https://pwd.py.gov.in/",
}

export const STATE_NAMES = Object.keys(STATE_URLS).sort()
