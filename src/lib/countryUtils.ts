export const countryCodeMap: Record<string, string> = {
  'afghanistan': 'af', 'albania': 'al', 'algeria': 'dz', 'andorra': 'ad', 'angola': 'ao',
  'argentina': 'ar', 'armenia': 'am', 'australia': 'au', 'austria': 'at', 'azerbaijan': 'az',
  'bahamas': 'bs', 'bahrain': 'bh', 'bangladesh': 'bd', 'barbados': 'bb', 'belarus': 'by',
  'belgium': 'be', 'belize': 'bz', 'benin': 'bj', 'bhutan': 'bt', 'bolivia': 'bo',
  'bosnia and herzegovina': 'ba', 'bosnia': 'ba', 'botswana': 'bw', 'brazil': 'br', 'brunei': 'bn',
  'bulgaria': 'bg', 'burkina faso': 'bf', 'burundi': 'bi', 'cambodia': 'kh', 'cameroon': 'cm',
  'canada': 'ca', 'cape verde': 'cv', 'central african republic': 'cf', 'chad': 'td', 'chile': 'cl',
  'china': 'cn', 'colombia': 'co', 'comoros': 'km', 'congo': 'cg', 'costa rica': 'cr',
  'croatia': 'hr', 'cuba': 'cu', 'cyprus': 'cy', 'czech republic': 'cz', 'czechia': 'cz',
  'denmark': 'dk', 'djibouti': 'dj', 'dominica': 'dm', 'dominican': 'do', 'dominican republic': 'do',
  'ecuador': 'ec', 'egypt': 'eg', 'el salvador': 'sv', 'equatorial guinea': 'gq', 'eritrea': 'er',
  'estonia': 'ee', 'eswatini': 'sz', 'ethiopia': 'et', 'fiji': 'fj', 'finland': 'fi', 'france': 'fr', 'fr': 'fr',
  'gabon': 'ga', 'gambia': 'gm', 'georgia': 'ge', 'germany': 'de', 'ghana': 'gh', 'greece': 'gr',
  'grenada': 'gd', 'guatemala': 'gt', 'guinea': 'gn', 'guinea-bissau': 'gw', 'guyana': 'gy',
  'haiti': 'ht', 'honduras': 'hn', 'hungary': 'hu', 'iceland': 'is', 'india': 'in', 'indonesia': 'id',
  'iran': 'ir', 'iraq': 'iq', 'ireland': 'ie', 'israel': 'il', 'italy': 'it', 'ivory coast': 'ci',
  "côte d'ivoire": 'ci', 'jamaica': 'jm', 'japan': 'jp', 'jordan': 'jo', 'kazakhstan': 'kz',
  'kenya': 'ke', 'kiribati': 'ki', 'kuwait': 'kw', 'kyrgyzstan': 'kg', 'laos': 'la', 'latvia': 'lv',
  'lebanon': 'lb', 'lesotho': 'ls', 'liberia': 'lr', 'libya': 'ly', 'liechtenstein': 'li',
  'lithuania': 'lt', 'luxembourg': 'lu', 'madagascar': 'mg', 'malawi': 'mw', 'malaysia': 'my',
  'maldives': 'mv', 'mali': 'ml', 'malta': 'mt', 'marshall islands': 'mh', 'mauritania': 'mr',
  'mauritius': 'mu', 'mexico': 'mx', 'micronesia': 'fm', 'moldova': 'md', 'monaco': 'mc',
  'mongolia': 'mn', 'montenegro': 'me', 'morocco': 'ma', 'mozambique': 'mz', 'myanmar': 'mm',
  'burma': 'mm', 'namibia': 'na', 'nauru': 'nr', 'nepal': 'np', 'netherlands': 'nl', 'new zealand': 'nz',
  'nicaragua': 'ni', 'niger': 'ne', 'nigeria': 'ng', 'north korea': 'kp', 'north macedonia': 'mk',
  'macedonia': 'mk', 'norway': 'no', 'oman': 'om', 'pakistan': 'pk', 'palau': 'pw', 'palestine': 'ps',
  'panama': 'pa', 'papua new guinea': 'pg', 'paraguay': 'py', 'peru': 'pe', 'philippines': 'ph',
  'poland': 'pl', 'portugal': 'pt', 'qatar': 'qa', 'romania': 'ro', 'russia': 'ru', 'rwanda': 'rw',
  'saint kitts and nevis': 'kn', 'saint lucia': 'lc', 'saint vincent and the grenadines': 'vc',
  'samoa': 'ws', 'san marino': 'sm', 'sao tome and principe': 'st', 'saudi arabia': 'sa', 'senegal': 'sn',
  'serbia': 'rs', 'seychelles': 'sc', 'sierra leone': 'sl', 'singapore': 'sg', 'slovakia': 'sk',
  'slovenia': 'si', 'solomon islands': 'sb', 'somalia': 'so', 'south africa': 'za', 'south korea': 'kr',
  'south sudan': 'ss', 'spain': 'es', 'sri lanka': 'lk', 'sudan': 'sd', 'suriname': 'sr', 'sweden': 'se',
  'switzerland': 'ch', 'syria': 'sy', 'taiwan': 'tw', 'tajikistan': 'tj', 'tanzania': 'tz', 'thailand': 'th',
  'timor-leste': 'tl', 'togo': 'tg', 'tonga': 'to', 'trinidad': 'tt', 'trinidad and tobago': 'tt',
  'tunisia': 'tn', 'turkey': 'tr', 'turkmenistan': 'tm', 'tuvalu': 'tv', 'uganda': 'ug', 'ukraine': 'ua',
  'uae': 'ae', 'united arab emirates': 'ae', 'uk': 'gb', 'united kingdom': 'gb', 'great britain': 'gb',
  'england': 'gb', 'usa': 'us', 'united states': 'us', 'us': 'us', 'uruguay': 'uy', 'uzbekistan': 'uz',
  'vanuatu': 'vu', 'vatican city': 'va', 'venezuela': 've', 'vietnam': 'vn', 'yemen': 'ye',
  'zambia': 'zm', 'zimbabwe': 'zw'
};

export const getCountryCode = (countryName: string): string => {
  if (!countryName || typeof countryName !== 'string') return 'un';
  
  const normalized = countryName.toLowerCase().trim();
  
  // 1. Direct match
  if (countryCodeMap[normalized]) {
    return countryCodeMap[normalized];
  }
  
  // 2. Word-by-word match (e.g., "Lebanon TV" -> matches "Lebanon")
  const words = normalized.split(/[\s,._-]+/);
  for (const word of words) {
    if (word.length < 2) continue; // Allow 'fr', 'tn', 'dz', etc.
    if (countryCodeMap[word]) {
      return countryCodeMap[word];
    }
  }

  // 3. Substring match
  for (const [key, code] of Object.entries(countryCodeMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return code;
    }
  }

  // 4. ISO Alpha-2 fallback
  if (normalized.length === 2 && /^[a-z]{2}$/.test(normalized)) {
    return normalized;
  }
  
  return 'un';
};
