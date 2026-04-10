/**
 * platforms/linkedin.js
 * LinkedIn — cookie-based scraping via direct API calls.
 * LinkedIn has no public API. Requires authenticated cookies.
 *
 * NOTE: LinkedIn aggressively rate-limits scrapers.
 * All responses are structured and rate-limit-aware.
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchJSON, fetchText } from '../core/exec.js';
import { getAuth, hasAuth } from '../core/auth.js';

const LI_API = 'https://www.linkedin.com/voyager/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCookieHeader() {
  const auth = getAuth('linkedin');
  if (!hasAuth('linkedin', ['cookie_json'])) {
    const err = new Error('LinkedIn auth required. Run: webcli auth linkedin');
    err.hint = 'webcli auth linkedin';
    throw err;
  }

  try {
    const cookies = JSON.parse(auth.cookie_json);
    return cookies.map(c => `${c.name}=${c.value}`).join('; ');
  } catch {
    throw new Error('Invalid LinkedIn cookie JSON. Re-run: webcli auth linkedin');
  }
}

function getCsrfToken(cookieStr) {
  const match = cookieStr.match(/JSESSIONID="([^"]+)"/);
  return match ? match[1] : 'ajax:0000000000000000';
}

async function linkedinFetch(path, params = {}) {
  const cookieStr = getCookieHeader();
  const csrf = getCsrfToken(cookieStr);
  const url = new URL(`${LI_API}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }

  return fetchJSON(url.toString(), {
    headers: {
      Cookie: cookieStr,
      'Csrf-Token': csrf,
      'X-RestLi-Protocol-Version': '2.0.0',
      'X-Li-Lang': 'en_US',
      'Accept': 'application/vnd.linkedin.normalized+json+2.1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
}

function formatJob(job) {
  const j = job?.jobPosting || job;
  return {
    id: j?.entityUrn?.split(':').pop() || j?.id,
    title: j?.title,
    company: j?.companyDetails?.company?.name || j?.companyName,
    location: j?.formattedLocation || j?.location,
    description: j?.description?.text?.slice(0, 600) || null,
    listed_at: j?.listedAt ? new Date(j.listedAt).toISOString() : null,
    apply_url: j?.applyMethod?.companyApplyUrl?.url || null,
    remote: j?.workRemoteAllowed || false,
    seniority: j?.title?.match(/senior|junior|lead|principal|staff/i)?.[0] || null,
  };
}

// ── Command builder ───────────────────────────────────────────────────────────

export function linkedinCommand() {
  const cmd = new Command('linkedin').alias('li').description('[EXPERIMENTAL] LinkedIn commands (fragile cookie auth)');

  // search-jobs
  cmd
    .command('search-jobs <query>')
    .description('[EXPERIMENTAL] Search LinkedIn job postings')
    .option('-l, --limit <n>', 'Number of results', '10')
    .option('--location <city>', 'Filter by location')
    .option('--remote', 'Remote jobs only')
    .option('--experience <level>', 'Experience: 1=internship 2=entry 3=associate 4=mid-senior 5=director 6=executive')
    .action(withErrorHandling('linkedin', async (query, opts) => {
      const params = {
        keywords: query,
        count: opts.limit,
        start: 0,
        decorationId: 'com.linkedin.flagship3.d_flagship3_search_f_jobs',
      };
      if (opts.location) params.locationFallback = opts.location;
      if (opts.remote) params.f_WT = '2';
      if (opts.experience) params.f_E = opts.experience;

      const data = await linkedinFetch('/search/hits', {
        ...params,
        q: 'jobs',
        query: JSON.stringify({ keywords: query }),
      }).catch(() => {
        // Fallback: use jobs voyager endpoint
        return linkedinFetch('/jobs/jobPostings', params);
      });

      const elements = data?.elements || data?.included || [];
      const results = elements
        .filter(e => e?.jobPosting || e?.title)
        .slice(0, parseInt(opts.limit))
        .map(formatJob);

      output(envelope('linkedin', 'search-jobs', results, { query, experimental: true }));
    }));

  // search-people
  cmd
    .command('search-people <query>')
    .description('[EXPERIMENTAL] Search LinkedIn people')
    .option('-l, --limit <n>', 'Number of results', '10')
    .option('--company <name>', 'Filter by company')
    .action(withErrorHandling('linkedin', async (query, opts) => {
      const params = {
        keywords: query,
        count: opts.limit,
        start: 0,
        origin: 'GLOBAL_SEARCH_HEADER',
        q: 'all',
        filters: 'List()',
      };

      const data = await linkedinFetch('/search/hits', {
        ...params,
        query: JSON.stringify({ keywords: query, filters: { resultType: ['PEOPLE'] } }),
      });

      const elements = data?.elements || [];
      const results = elements
        .filter(e => e?.targetUrn?.includes('fsd_profile') || e?.publicIdentifier)
        .slice(0, parseInt(opts.limit))
        .map(e => ({
          name: `${e?.firstName || ''} ${e?.lastName || ''}`.trim() || e?.name,
          headline: e?.headline || e?.occupation,
          location: e?.subline?.text || e?.location,
          company: e?.primarySubtitle?.text || opts.company,
          profile_url: e?.publicIdentifier ? `https://www.linkedin.com/in/${e.publicIdentifier}` : null,
        }));

      output(envelope('linkedin', 'search-people', results, { query, experimental: true }));
    }));

  // company
  cmd
    .command('company <identifier>')
    .description('[EXPERIMENTAL] Get LinkedIn company info')
    .action(withErrorHandling('linkedin', async (identifier) => {
      // Extract identifier from URL if passed
      const vanity = identifier.replace(/.*linkedin\.com\/company\//, '').replace(/\/$/, '');
      const data = await linkedinFetch(`/organization/companies`, { vanityName: vanity, decorationId: 'com.linkedin.flagship3.d_flagship3_company_detail' });

      const company = data?.elements?.[0] || data;
      output(envelope('linkedin', 'company', {
        name: company?.name,
        tagline: company?.tagline,
        description: company?.description?.slice(0, 600),
        industry: company?.companyIndustries?.[0]?.localizedName,
        size: company?.staffCountRange,
        headquarters: company?.headquarter
          ? `${company.headquarter.city}, ${company.headquarter.country}`
          : null,
        website: company?.companyPageUrl,
        followers: company?.followingInfo?.followerCount,
        url: `https://www.linkedin.com/company/${vanity}`,
      }, { experimental: true }));
    }));

  return cmd;
}
