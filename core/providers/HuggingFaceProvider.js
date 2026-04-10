/**
 * core/providers/HuggingFaceProvider.js
 * Headless HuggingFace metadata retrieval
 */

import { fetchText } from '../exec.js';

export class HuggingFaceProvider {
  
  async _fetchHf(urlPath, repoId) {
    const { default: fetch } = await import('node-fetch');
    const url = `https://huggingface.co/api/${urlPath}/${repoId}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'webcli/1.0 (AI Agent Wrapper)'
      }
    });

    if (!res.ok) {
      const err = new Error();
      err.status = res.status;
      
      if (res.status === 404) {
        err.code = 'NOT_FOUND';
        err.message = `Resource '${repoId}' was not found.`;
      } else if (res.status === 403 || res.status === 401) {
        // HF distinguishes gating via specific error payloads.
        try {
          const body = await res.json();
          if (body.error && body.error.toLowerCase().includes('gated')) {
            err.code = 'GATED_RESOURCE';
            err.message = `Resource '${repoId}' is gated. You must agree to its terms on the HuggingFace website to access it.`;
          } else {
            err.code = 'PRIVATE_RESOURCE';
            err.message = `Resource '${repoId}' is private or requires authentication API keys to view.`;
          }
        } catch {
          err.code = 'PRIVATE_RESOURCE';
          err.message = `Resource '${repoId}' operates behind a 403 Forbidden wall.`;
        }
      } else {
        err.code = 'HTTP_ERROR';
        err.message = `HuggingFace returned an unexpected HTTP ${res.status} error.`;
      }
      throw err;
    }

    return await res.json();
  }

  async _fetchReadmeExcerpt(repoId, type = "models") {
    try {
      // type can be models or datasets (hf dataset repos prefix with datasets/ in url)
      const prefix = type === "datasets" ? "datasets/" : "";
      const rawUrl = `https://huggingface.co/${prefix}${repoId}/raw/main/README.md`;
      const text = await fetchText(rawUrl, { cache: true });
      if (text) {
        // Find first text block after frontmatter
        const noFrontmatter = text.replace(/^---[\s\S]*?---/, '').trim();
        return noFrontmatter.slice(0, 500).replace(/\n+/g, ' ').trim() + '...';
      }
    } catch { }
    return null;
  }

  async getModel(repoId) {
    if (!repoId.includes('/')) {
      const err = new Error(`Invalid repo-id '${repoId}'. Expected format: author/model-name or similar.`);
      err.code = 'INVALID_REPO_ID';
      throw err;
    }

    const data = await this._fetchHf('models', repoId);
    
    let description = null;
    if (data.cardData && typeof data.cardData.model_description === 'string') {
      description = data.cardData.model_description.slice(0, 500) + '...';
    } else {
      description = await this._fetchReadmeExcerpt(repoId, "models");
    }

    return {
      type: "model",
      id: data.id || repoId,
      source: "huggingface",
      card: {
        author: data.author,
        pipeline_tag: data.pipeline_tag,
        library_name: data.library_name,
        license: data.cardData?.license || undefined,
        downloads: data.downloads,
        likes: data.likes,
        tags: data.tags || [],
        last_modified: data.lastModified,
        gated: data.gated !== false && data.gated !== undefined,
        private: data.private || false
      },
      readme_excerpt: description,
      links: {
        repo: `https://huggingface.co/${repoId}`,
        card: `https://huggingface.co/${repoId}`
      }
    };
  }

  async getDataset(repoId) {
    if (!repoId.includes('/')) {
      // Note: HF datasets can be base names (e.g., 'squad'), so we won't rigidly fail format for datasets
    }

    const data = await this._fetchHf('datasets', repoId);
    
    let description = null;
    if (data.cardData && typeof data.cardData.dataset_info === 'string') {
      description = data.cardData.dataset_info.slice(0, 500) + '...';
    } else {
      description = await this._fetchReadmeExcerpt(repoId, "datasets");
    }

    return {
      type: "dataset",
      id: data.id || repoId,
      source: "huggingface",
      card: {
        author: data.author,
        license: data.cardData?.license || undefined,
        task_categories: data.cardData?.task_categories || [],
        languages: data.cardData?.language || [],
        downloads: data.downloads,
        likes: data.likes,
        tags: data.tags || [],
        last_modified: data.lastModified,
        gated: data.gated !== false && data.gated !== undefined && data.gated !== 'false',
        private: data.private || false
      },
      readme_excerpt: description,
      links: {
        repo: `https://huggingface.co/datasets/${repoId}`,
        card: `https://huggingface.co/datasets/${repoId}`
      }
    };
  }
}
