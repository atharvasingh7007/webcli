/**
 * platforms/npm.js
 * npm registry — uses the public registry API. Zero auth needed.
 * Agents use this to research packages, check versions, find alternatives.
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchJSON } from '../core/exec.js';

const REGISTRY = 'https://registry.npmjs.org';
const SEARCH_API = 'https://registry.npmjs.org/-/v1/search';
const DOWNLOADS_API = 'https://api.npmjs.org/downloads';

export function npmCommand() {
  const cmd = new Command('npm').description('npm registry commands');

  // search
  cmd
    .command('search <query>')
    .description('Search npm packages')
    .option('-l, --limit <n>', 'Number of results', '10')
    .action(withErrorHandling('npm', async (query, opts) => {
      const url = new URL(SEARCH_API);
      url.searchParams.set('text', query);
      url.searchParams.set('size', opts.limit);

      const data = await fetchJSON(url.toString());
      const results = data.objects.map(o => ({
        name: o.package.name,
        version: o.package.version,
        description: o.package.description,
        keywords: o.package.keywords?.slice(0, 8),
        author: o.package.author?.name,
        publisher: o.package.publisher?.username,
        date: o.package.date,
        links: {
          npm: o.package.links?.npm,
          homepage: o.package.links?.homepage,
          repository: o.package.links?.repository,
        },
        score: {
          final: o.score?.final?.toFixed(3),
          quality: o.score?.detail?.quality?.toFixed(3),
          popularity: o.score?.detail?.popularity?.toFixed(3),
          maintenance: o.score?.detail?.maintenance?.toFixed(3),
        },
        downloads_flag: o.flags,
      }));

      output(envelope('npm', 'search', results, { query }));
    }));

  // info — full package details
  cmd
    .command('info <package>')
    .description('Get detailed info about an npm package')
    .option('--version <v>', 'Specific version (default: latest)')
    .action(withErrorHandling('npm', async (pkg, opts) => {
      const url = opts.version
        ? `${REGISTRY}/${pkg}/${opts.version}`
        : `${REGISTRY}/${pkg}/latest`;

      const data = await fetchJSON(url);

      output(envelope('npm', 'info', {
        name: data.name,
        version: data.version,
        description: data.description,
        author: data.author,
        license: data.license,
        homepage: data.homepage,
        repository: data.repository?.url,
        keywords: data.keywords?.slice(0, 15),
        dependencies: Object.keys(data.dependencies || {}).length,
        dev_dependencies: Object.keys(data.devDependencies || {}).length,
        peer_dependencies: Object.keys(data.peerDependencies || {}),
        engines: data.engines,
        main: data.main,
        types: data.types || data.typings,
        scripts: Object.keys(data.scripts || {}),
        dist: {
          tarball: data.dist?.tarball,
          size: data.dist?.unpackedSize,
          file_count: data.dist?.fileCount,
        },
        npm_url: `https://www.npmjs.com/package/${pkg}`,
      }));
    }));

  // versions — list all versions of a package
  cmd
    .command('versions <package>')
    .description('List all versions of an npm package')
    .option('-l, --limit <n>', 'Show last N versions', '20')
    .action(withErrorHandling('npm', async (pkg, opts) => {
      const data = await fetchJSON(`${REGISTRY}/${pkg}`);
      const allVersions = Object.keys(data.versions || {}).reverse();
      const versions = allVersions.slice(0, parseInt(opts.limit));

      output(envelope('npm', 'versions', {
        name: pkg,
        latest: data['dist-tags']?.latest,
        tags: data['dist-tags'],
        total_versions: allVersions.length,
        recent_versions: versions,
      }));
    }));

  // downloads — get download stats
  cmd
    .command('downloads <package>')
    .description('Get download statistics for an npm package')
    .option('--period <p>', 'Period: last-day | last-week | last-month | last-year', 'last-month')
    .action(withErrorHandling('npm', async (pkg, opts) => {
      const data = await fetchJSON(`${DOWNLOADS_API}/point/${opts.period}/${pkg}`);

      output(envelope('npm', 'downloads', {
        name: pkg,
        period: opts.period,
        downloads: data.downloads,
        start: data.start,
        end: data.end,
        npm_url: `https://www.npmjs.com/package/${pkg}`,
      }));
    }));

  // deps — list direct dependencies of a package
  cmd
    .command('deps <package>')
    .description('List dependencies of an npm package')
    .option('--version <v>', 'Specific version (default: latest)')
    .action(withErrorHandling('npm', async (pkg, opts) => {
      const url = opts.version
        ? `${REGISTRY}/${pkg}/${opts.version}`
        : `${REGISTRY}/${pkg}/latest`;

      const data = await fetchJSON(url);

      output(envelope('npm', 'deps', {
        name: data.name,
        version: data.version,
        dependencies: data.dependencies || {},
        dev_dependencies: data.devDependencies || {},
        peer_dependencies: data.peerDependencies || {},
        optional_dependencies: data.optionalDependencies || {},
      }));
    }));

  return cmd;
}
