/**
 * core/providers/DockerProvider.js
 * Base interface for querying docker container registries
 */

export class DockerProvider {
  /**
   * Retrieves high level repository metadata.
   */
  async getImage(imageName, opts = {}) {
    throw new Error('Not implemented');
  }

  /**
   * Paginates metadata and image definitions for available registry tags.
   */
  async getTags(imageName, opts = {}) {
    throw new Error('Not implemented');
  }
}
