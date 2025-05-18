// this class provides a eagle logic wrapper, which is independent to eagle
// this is currently incomplete solution

import path from 'path';
import { JsonFile } from './utils/autoFile';

interface EWOMFolder {
  id: string;
  name: string;
  description: string;
  children: EWOMFolder[];
  modificationTime: number;
  tags: string[];
  password: string;
  passwordTips: string;
}

interface EWOMTagsGroup {
  id: string;
  name: string;
  tags: string[];
}

interface EWOMetadataData {
  folders: EWOMFolder[];
  smartFolders: any[];
  quickAccess: any[];
  tagsGroups: EWOMTagsGroup[];
  modificationTime: number;
  applicationVersion: string;
}

interface EWOMetadataData extends Record<string, unknown> {
  folders: EWOMFolder[];
  smartFolders: any[];
  quickAccess: any[];
  tagsGroups: EWOMTagsGroup[];
  modificationTime: number;
  applicationVersion: string;
}

class EWOMetadata extends JsonFile<EWOMetadataData> {
  constructor(filePath: string) {
    super(filePath);
  }

  static fromPath(filePath: string): EWOMetadata {
    return JsonFile.from.call(EWOMetadata, filePath) as EWOMetadata;
  }

  getFolderById(id: string): EWOMFolder | undefined {
    const findFolder = (folders: EWOMFolder[]): EWOMFolder | undefined => {
      for (const folder of folders) {
        if (folder.id === id) return folder;
        if (folder.children.length > 0) {
          const found = findFolder(folder.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findFolder(this.getData().folders);
  }

  getTagsGroupById(id: string): EWOMTagsGroup | undefined {
    return this.getData().tagsGroups.find(group => group.id === id);
  }

  getTagsGroupByName(name: string): EWOMTagsGroup | undefined {
    return this.getData().tagsGroups.find(group => group.name === name);
  }
}

class EWOMtime {}

class EWOSavedFilters {}

class EWOTags {}

class EWOActions {}

class EagleWrapover {
  _directory: string;
  _metadata: EWOMetadata | null;
  _mtime: EWOMtime | null;
  _savedFilters: EWOSavedFilters | null;
  _tags: EWOTags | null;
  _actions: EWOActions | null;

  constructor(directory: string) {
    this._directory = directory;
    this._metadata = null;
    this._mtime = null;
    this._savedFilters = null;
    this._tags = null;
    this._actions = null;
  }

  get directory(): string {
    return this._directory;
  }

  get metadata(): EWOMetadata {
    if (!this._metadata) {
      this._metadata = EWOMetadata.fromPath(
        path.join(this._directory, 'metadata.json')
      );
    }
    return this._metadata;
  }
}

// incomplete solution
export { EagleWrapover };
