/**
 * platforms/pypi.js
 * PyPI — Python Package Index public API. No auth needed.
 * Mirrors the npm platform but for Python — useful for agents working in Python stacks.
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchJSON } from '../core/exec.js';

const API = 'https://pypi.org/pypi';
const SEARCH_API = 'https://pypi.org/search';

export function pypiCommand() {
  const cmd = new Command('pypi').description('PyPI Python package commands');

  // info
  cmd
    .command('info <package>')
    .description('Get detailed info about a PyPI package')
    .option('--version <v>', 'Specific version (default: latest)')
    .action(withErrorHandling('pypi', async (pkg, opts) => {
      const url = opts.version
        ? `${API}/${pkg}/${opts.version}/json`
        : `${API}/${pkg}/json`;

      const data = await fetchJSON(url);
      const info = data.info;

      output(envelope('pypi', 'info', {
        name: info.name,
        version: info.version,
        summary: info.summary,
        description: info.description?.slice(0, 800),
        author: info.author,
        author_email: info.author_email,
        license: info.license,
        home_page: info.home_page,
        project_urls: info.project_urls,
        keywords: info.keywords,
        classifiers: info.classifiers?.filter(c => c.startsWith('Programming Language') || c.startsWith('Framework')).slice(0, 10),
        requires_python: info.requires_python,
        requires_dist: info.requires_dist?.slice(0, 20),
        pypi_url: `https://pypi.org/project/${pkg}`,
        releases_count: Object.keys(data.releases || {}).length,
        latest_releases: Object.keys(data.releases || {}).reverse().slice(0, 10),
      }));
    }));

  // search — PyPI doesn't have an official search API, use the JSON search endpoint
  cmd
    .command('search <query>')
    .description('Search PyPI packages')
    .option('-l, --limit <n>', 'Number of results', '10')
    .action(withErrorHandling('pypi', async (query, opts) => {
      // PyPI search via the XML-RPC API
      const { fetchText } = await import('../core/exec.js');
      const xmlrpc = `<?xml version='1.0'?>
<methodCall>
  <methodName>search</methodName>
  <params>
    <param><value><struct>
      <member><name>name</name><value><string>${query}</string></value></member>
    </struct></value></param>
  </params>
</methodCall>`;

      const response = await fetchText('https://pypi.org/pypi', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: xmlrpc,
      });

      // Parse XML-RPC response
      const nameMatches = [...response.matchAll(/<name>([^<]+)<\/name>\s*<value><string>([^<]*)<\/string><\/value>/g)];
      const packages = [];
      let current = {};

      for (const block of response.matchAll(/<struct>([\s\S]*?)<\/struct>/g)) {
        const members = {};
        for (const m of block[1].matchAll(/<name>([^<]+)<\/name>\s*<value>(?:<[^>]+>)?([^<]*)(?:<\/[^>]+>)?<\/value>/g)) {
          members[m[1].trim()] = m[2].trim();
        }
        if (members.name) {
          packages.push({
            name: members.name,
            version: members.version,
            summary: members.summary,
            pypi_url: `https://pypi.org/project/${members.name}`,
          });
        }
      }

      output(envelope('pypi', 'search', packages.slice(0, parseInt(opts.limit)), { query }));
    }));

  // versions
  cmd
    .command('versions <package>')
    .description('List all versions of a PyPI package')
    .option('-l, --limit <n>', 'Show last N versions', '20')
    .action(withErrorHandling('pypi', async (pkg, opts) => {
      const data = await fetchJSON(`${API}/${pkg}/json`);
      const allVersions = Object.keys(data.releases || {}).reverse();

      output(envelope('pypi', 'versions', {
        name: pkg,
        latest: data.info.version,
        total_versions: allVersions.length,
        recent_versions: allVersions.slice(0, parseInt(opts.limit)),
      }));
    }));

  return cmd;
}
