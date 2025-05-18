import fs from 'fs';
import path from 'path';

class MetaExt {
  content: Record<string, unknown>;
  path: string;
  constructor(content: Record<string, unknown>, path: string) {
    this.content = content;
    this.path = path;
  }
  save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.content, null, 2));
  }
}

type TagConfig = Record<string, unknown>;

class LibraryConfig {
  folderConfigs: Map<string, FolderConfig> = new Map();
  tagConfigs: Map<string, TagConfig> = new Map();
  config: Record<string, unknown>;
  path: string;

  constructor(
    config: {
      config: Record<string, unknown>;
      folderConfigs: Map<string, FolderConfig>;
      tagConfigs: Map<string, TagConfig>;
    },
    path: string
  ) {
    this.config = config.config;
    this.folderConfigs = config.folderConfigs;
    this.tagConfigs = config.tagConfigs;
    this.path = path;
  }

  static fromPath(path: string): LibraryConfig {
    const config = JSON.parse(fs.readFileSync(path, 'utf8'));
    return new LibraryConfig(config, path);
  }

  static fromLibraryPath(libraryPath: string): LibraryConfig {
    const configPath = path.join(libraryPath, 'metaext.json');
    if (!fs.existsSync(configPath)) {
      // create the file
      fs.writeFileSync(
        configPath,
        '{"folderConfigs":{},"tagConfigs":{},"config":{}}'
      );
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as {
      folderConfigs: Array<{ id: string }>;
      tagConfigs: Array<{ id: string }>;
      config: Record<string, unknown>;
    };
    const folderConfigs = new Map<string, FolderConfig>();
    for (const folder of config.folderConfigs) {
      folderConfigs.set(
        folder.id,
        new FolderConfig(
          new LibraryConfig(
            { config, folderConfigs: new Map(), tagConfigs: new Map() },
            configPath
          ),
          folder.id
        )
      );
    }
    const tagConfigs = new Map<string, TagConfig>();
    for (const tag of config.tagConfigs) {
      tagConfigs.set(tag.id, tag);
    }
    return new LibraryConfig({ config, folderConfigs, tagConfigs }, configPath);
  }

  static fromItem(item: Item): LibraryConfig {
    const libraryPath = Meta.item.libraryPath(item);
    return this.fromLibraryPath(libraryPath);
  }

  static fromEagle(): LibraryConfig {
    const libraryPath = eagle.library.path;
    return this.fromLibraryPath(libraryPath);
  }

  save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 2));
  }

  folderConfig(folder: Folder | string): FolderConfig {
    if (typeof folder === 'string') {
      return new FolderConfig(this, folder);
    }
    return new FolderConfig(this, folder.id);
  }
}

class FolderConfig {
  _libraryConfig: LibraryConfig;
  _folderId: string;

  constructor(libraryConfig: LibraryConfig, folderId: string) {
    this._libraryConfig = libraryConfig;
    this._folderId = folderId;
  }

  get config(): FolderConfig | undefined {
    return this._libraryConfig.folderConfigs.get(this._folderId);
  }

  save(): void {
    this._libraryConfig.save();
  }
}

class AppConfig {
  config: Record<string, unknown>;
  path: string;

  constructor(config: Record<string, unknown>, path: string) {
    this.config = config;
    this.path = path;
  }

  save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 2));
  }

  scope(scope: string | null = null): Record<string, unknown> {
    if (scope === null) {
      scope = Meta.selfIdentifyId;
    }
    if (!(scope in this.config)) {
      this.config[scope] = {};
    }
    return this.config[scope] as Record<string, unknown>;
  }
}

class Meta {
  static selfIdentifyId = 'universal';

  static readonly item = {
    dirname(item: Item): string {
      const itemRealPath = item.filePath;
      return path.dirname(itemRealPath);
    },
    metaextPath(item: Item): string {
      const dirname = this.dirname(item);
      // touch the file of dirname/metaext.json if not exists
      const metaextPath = path.join(dirname, 'metaext.json');
      if (!fs.existsSync(metaextPath)) {
        fs.writeFileSync(metaextPath, '{}');
      }
      return metaextPath;
    },
    metaext(item: Item): MetaExt {
      const metaextPath = this.metaextPath(item);
      const metaext = JSON.parse(fs.readFileSync(metaextPath, 'utf8'));
      return new MetaExt(metaext, metaextPath);
    },

    metafilePath(item: Item): string | null {
      const dirname = this.dirname(item);
      const metafile = path.join(dirname, 'metafile');
      if (!fs.existsSync(metafile)) {
        return null;
      }
      return metafile;
    },

    libraryPath(item: Item): string {
      const dirname = this.dirname(item);
      return path.dirname(path.dirname(dirname));
    },
  };

  static libraryConfig(): LibraryConfig {
    const libraryPath = eagle.library.path;
    return LibraryConfig.fromLibraryPath(libraryPath);
  }

  static folderConfig(folder: Folder | string): FolderConfig {
    const config = LibraryConfig.fromLibraryPath(eagle.library.path);
    return config.folderConfig(folder);
  }

  static async appConfigPath(): Promise<string> {
    const configPath = path.join(
      await eagle.app.getPath('userData'),
      'metaext.json'
    );
    return configPath;
  }

  static async appConfig(): Promise<AppConfig> {
    const configPath = await this.appConfigPath();
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, '{}');
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return new AppConfig(config, configPath);
  }

  static async pluginConfigPath(plugin: { path: string }): Promise<MetaExt> {
    const pluginPath = plugin.path;
    const configPath = path.join(pluginPath, 'metaext.json');
    if (!fs.existsSync(configPath)) {
      await fs.promises.writeFile(configPath, '{}');
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return new MetaExt(config, configPath);
  }
}

export { Meta };
