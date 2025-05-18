import path from 'path';

class WebApi {
  static token: string | null = null;

  static async _internalGetToken(): Promise<string | null> {
    if (WebApi.token) {
      return WebApi.token;
    }

    try {
      const res = await fetch('http://localhost:41595/api/application/info');
      if (!res) {
        throw new Error('No response from Eagle');
      }
      const raw = (await res.json()) as {
        data: { preferences: { developer: { apiToken: string } } };
      };
      const token = raw.data.preferences.developer.apiToken;
      if (token) {
        WebApi.token = token;
        return token;
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  static async _internalRequest<T>(
    path: string,
    methodname: 'GET' | 'POST',
    data: Record<string, unknown> | null = null,
    params: Record<string, unknown> | null = null
  ): Promise<T> {
    const token = await WebApi._internalGetToken();
    if (!token) throw new Error('No token found');

    let url = `http://localhost:41595/api/${path}?token=${token}`;
    if (params) {
      url +=
        '&' +
        Object.entries(params)
          .filter(([, v]) => v !== null)
          .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
          .join('&');
    }
    if (methodname === 'POST' && data) {
      data = Object.entries(data)
        .filter(([, v]) => v !== null)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    }

    try {
      const response = await fetch(
        url,
        methodname === 'POST'
          ? {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            }
          : undefined
      );

      const json = (await response.json()) as { data: T };
      return json.data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  static application = class {
    static info(): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('application/info', 'GET');
    }
  };

  static folder = class {
    static create(
      name: string,
      parentId: string | null = null
    ): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('folder/create', 'POST', {
        folderName: name,
        parent: parentId,
      });
    }

    static rename(
      folderId: string,
      newName: string
    ): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('folder/rename', 'POST', {
        folderId,
        newName,
      });
    }

    static update({
      folderId,
      newName = null,
      newDescription = null,
      newColor = null,
    }: {
      folderId: string;
      newName?: string | null;
      newDescription?: string | null;
      newColor?: string | null;
    }): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('folder/update', 'POST', {
        folderId,
        newName,
        newDescription,
        newColor,
      });
    }

    static list(): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('folder/list', 'GET');
    }

    static listRecent(): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('folder/listRecent', 'GET');
    }
  };

  static library = class {
    static info(): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('library/info', 'GET');
    }

    static history(): Promise<string[]> {
      return WebApi._internalRequest('library/history', 'GET');
    }

    static switch(libraryPath: string): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('library/switch', 'POST', {
        libraryPath,
      });
    }

    static icon(libraryPath: string): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('library/icon', 'GET', null, {
        libraryPath,
      });
    }
  };

  static item = class {
    static update({
      itemId,
      tags = null,
      annotation = null,
      url = null,
      star = null,
    }: {
      itemId: string;
      tags?: string[] | null;
      annotation?: string | null;
      url?: string | null;
      star?: boolean | null;
    }): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/update', 'POST', {
        id: itemId,
        tags,
        annotation,
        url,
        star,
      });
    }

    static refreshThumbnail(itemId: string): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/refreshThumbnail', 'POST', {
        id: itemId,
      });
    }

    static refreshPalette(itemId: string): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/refreshPalette', 'POST', {
        id: itemId,
      });
    }

    static moveToTrash(itemIds: string[]): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/moveToTrash', 'POST', { itemIds });
    }

    static list({
      limit = 200,
      offset = 0,
      orderBy = null,
      keyword = null,
      ext = null,
      tags = null,
      folders = null,
    }: {
      limit?: number;
      offset?: number;
      orderBy?: string | null;
      keyword?: string | null;
      ext?: string | null;
      tags?: string[] | null;
      folders?: string[] | null;
    }): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/list', 'GET', null, {
        limit,
        offset,
        orderBy,
        keyword,
        ext,
        tags,
        folders,
      });
    }

    static getThumbnail(itemId: string): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/thumbnail', 'GET', null, {
        id: itemId,
      });
    }

    static getInfo(itemId: string): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/info', 'GET', null, {
        id: itemId,
      });
    }

    static addBookmark({
      url,
      name,
      base64 = null,
      tags = null,
      modificationTime = null,
      folderId = null,
    }: {
      url: string;
      name: string;
      base64?: string | null;
      tags?: string[] | null;
      modificationTime?: number | null;
      folderId?: string | null;
    }): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/addBookmark', 'POST', {
        url,
        name,
        base64,
        tags,
        modificationTime,
        folderId,
      });
    }

    static addFromUrl({
      url,
      name,
      website = null,
      tags = null,
      star = null,
      annotation = null,
      modificationTime = null,
      folderId = null,
      headers = null,
    }: {
      url: string;
      name: string;
      website?: string | null;
      tags?: string[] | null;
      star?: boolean | null;
      annotation?: string | null;
      modificationTime?: number | null;
      folderId?: string | null;
      headers?: Record<string, string> | null;
    }): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/addFromUrl', 'POST', {
        url,
        name,
        website,
        tags,
        star,
        annotation,
        modificationTime,
        folderId,
        headers,
      });
    }

    static addFromPath({
      path,
      name,
      website = null,
      annotation = null,
      tags = null,
      folderId = null,
    }: {
      path: string;
      name: string;
      website?: string | null;
      annotation?: string | null;
      tags?: string[] | null;
      folderId?: string | null;
    }): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/addFromPath', 'POST', {
        path,
        name,
        website,
        annotation,
        tags,
        folderId,
      });
    }

    static addFromURLs({
      items,
      folderId = null,
    }: {
      items: string[];
      folderId?: string | null;
    }): Promise<Record<string, unknown>> {
      return WebApi._internalRequest('item/addFromURLs', 'POST', {
        items,
        folderId,
      });
    }
  };
}

class WebApiUtils {
  static closestLibrary(libraryName: string): Promise<Record<string, number>> {
    return WebApi.library.history().then((histories: string[]) => {
      const names = histories.map((history: string) => [
        path.basename(history).replace('.library', ''),
        history,
      ]);

      // Calculate similarity scores using Levenshtein distance
      const scores: Record<string, number> = {};
      for (const [name, fullpath] of names) {
        scores[fullpath] = this._calculateSimilarity(libraryName, name);
      }
      return scores;
    });
  }

  static _calculateSimilarity(a: string, b: string): number {
    a = a.toLowerCase();
    b = b.toLowerCase();

    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[b.length][a.length];
    const maxLength = Math.max(a.length, b.length);
    return 1 - distance / maxLength;
  }

  static switchLibrary(
    libraryName: string,
    exactMatch = false,
    maxDistance = 0.5
  ): Promise<Record<string, unknown> | null> {
    if (exactMatch) {
      return WebApi.library.history().then((histories: string[]) => {
        for (const history of histories) {
          if (path.basename(history) === libraryName) {
            return WebApi.library.switch(history);
          }
        }
        return null;
      });
    }

    return this.closestLibrary(libraryName).then(scores => {
      console.log('scoring table:', scores);
      // Find candidate with highest score
      const closest = Object.entries(scores).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );
      if (closest[1] > maxDistance) {
        return WebApi.library.switch(closest[0]);
      } else {
        throw new Error('No library found');
      }
    });
  }
}

export { WebApi, WebApiUtils };
