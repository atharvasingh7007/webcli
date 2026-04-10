/**
 * core/providers/DockerHubProvider.js
 * Docker Hub specific registry parsing.
 */

import { DockerProvider } from './DockerProvider.js';
import { fetchJSON } from '../exec.js';

export class DockerHubProvider extends DockerProvider {
  
  _normalizeImage(image) {
    if (!image.includes('/')) return `library/${image}`;
    return image;
  }

  async getImage(image, opts = {}) {
    const name = this._normalizeImage(image);
    const url = `https://hub.docker.com/v2/repositories/${name}/`;
    
    try {
      const res = await fetchJSON(url);
      
      return {
        type: "image",
        image: image,
        source: "dockerhub",
        data: {
          name: res.name,
          namespace: res.namespace,
          official: res.namespace === 'library',
          description: res.description,
          star_count: res.star_count,
          pull_count: res.pull_count,
          last_updated: res.last_updated,
          status: res.status !== undefined ? res.status : null
        },
        links: {
          repo: `https://hub.docker.com/r/${res.namespace === 'library' ? '_' : res.namespace}/${res.name}`
        }
      };
    } catch (err) {
      if (err.status === 404) {
        err.code = 'NOT_FOUND';
        err.message = `Docker image '${image}' was not found on Docker Hub.`;
      } else if (err.status === 429) {
        err.code = 'RATE_LIMITED';
        err.message = 'Docker Hub rate limit exceeded.';
      }
      throw err;
    }
  }

  async getTags(image, opts = {}) {
    const name = this._normalizeImage(image);
    const limit = opts.limit ? parseInt(opts.limit) : 20;
    const url = `https://hub.docker.com/v2/repositories/${name}/tags/?page_size=${limit}`;
    
    try {
      const res = await fetchJSON(url);
      const tags = (res.results || []).map(t => {
        let archs = null;
        if (t.images && Array.isArray(t.images)) {
          // Explicitly accumulate clean architecture tags
          const aSet = new Set(t.images.map(img => img.architecture).filter(Boolean));
          if (aSet.size > 0) archs = Array.from(aSet);
        }
        return {
          name: t.name,
          last_updated: t.last_updated,
          digest: t.digest || (t.images && t.images[0] ? t.images[0].digest : null),
          size: t.full_size,
          architectures: archs
        };
      });

      return {
        type: "tags",
        image: image,
        source: "dockerhub",
        count: tags.length,
        tags: tags
      };
    } catch (err) {
      if (err.status === 404) {
        err.code = 'NOT_FOUND';
        err.message = `Docker image '${image}' was not found on Docker Hub.`;
      } else if (err.status === 429) {
        err.code = 'RATE_LIMITED';
        err.message = 'Docker Hub rate limit exceeded.';
      }
      throw err;
    }
  }
}
