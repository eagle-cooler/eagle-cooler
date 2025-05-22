import fs from 'fs';
import path from 'path';

/**
 * Represents a metadata extension with content and file path.
 * Provides functionality to save metadata to a file.
 */
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

/**
 * Manages library-level configuration including folder and tag configurations.
 * Provides functionality to load, save, and access library settings.
 */
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

  /**
   * Creates a LibraryConfig instance from a file path.
   * @param path - Path to the library configuration file
   * @returns A new LibraryConfig instance
   */
  static fromPath(path: string): LibraryConfig {
    const config = JSON.parse(fs.readFileSync(path, 'utf8'));
    return new LibraryConfig(config, path);
  }

  /**
   * Creates a LibraryConfig instance from a library path.
   * Creates a new configuration file if it doesn't exist.
   * @param libraryPath - Path to the library directory
   * @returns A new LibraryConfig instance
   */
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

  /**
   * Creates a LibraryConfig instance from an Eagle item.
   * @param item - The Eagle item to get library configuration for
   * @returns A new LibraryConfig instance
   */
  static fromItem(item: Item): LibraryConfig {
    const libraryPath = Meta.item.libraryPath(item);
    return this.fromLibraryPath(libraryPath);
  }

  /**
   * Creates a LibraryConfig instance from the current Eagle library.
   * @returns A new LibraryConfig instance
   */
  static fromEagle(): LibraryConfig {
    const libraryPath = eagle.library.path;
    return this.fromLibraryPath(libraryPath);
  }

  /**
   * Saves the current configuration to the file.
   */
  save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 2));
  }

  /**
   * Gets the folder configuration for a specific folder.
   * @param folder - The folder or folder ID to get configuration for
   * @returns A FolderConfig instance for the specified folder
   */
  folderConfig(folder: Folder | string): FolderConfig {
    if (typeof folder === 'string') {
      return new FolderConfig(this, folder);
    }
    return new FolderConfig(this, folder.id);
  }
}

/**
 * Manages folder-specific configuration within a library.
 * Provides access to folder-level settings and persistence.
 */
class FolderConfig {
  _libraryConfig: LibraryConfig;
  _folderId: string;

  constructor(libraryConfig: LibraryConfig, folderId: string) {
    this._libraryConfig = libraryConfig;
    this._folderId = folderId;
  }

  /**
   * Gets the configuration for this folder.
   * @returns The folder configuration or undefined if not found
   */
  get config(): FolderConfig | undefined {
    return this._libraryConfig.folderConfigs.get(this._folderId);
  }

  /**
   * Saves the current folder configuration.
   */
  save(): void {
    this._libraryConfig.save();
  }
}

/**
 * Manages application-wide configuration settings.
 * Provides functionality to load, save, and access app-level settings.
 */
class AppConfig {
  config: Record<string, unknown>;
  path: string;

  constructor(config: Record<string, unknown>, path: string) {
    this.config = config;
    this.path = path;
  }

  /**
   * Saves the current configuration to the file.
   */
  save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 2));
  }

  /**
   * Gets or creates a configuration scope.
   * @param scope - The scope name to get configuration for, defaults to Meta.selfIdentifyId
   * @returns The configuration object for the specified scope
   */
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

/**
 * Main class for metadata management in Eagle.
 * Provides comprehensive functionality for handling metadata at various levels:
 * - Item-level metadata
 * - Library-level configuration
 * - Folder-level settings
 * - Application-wide configuration
 */
class Meta {
  static selfIdentifyId = 'universal';

  static readonly item = {
    /**
     * Gets the directory name for an item.
     * @param item - The Eagle item
     * @returns The directory path containing the item
     */
    dirname(item: Item): string {
      const itemRealPath = item.filePath;
      return path.dirname(itemRealPath);
    },

    /**
     * Gets or creates the metadata extension file path for an item.
     * @param item - The Eagle item
     * @returns The path to the metadata extension file
     */
    metaextPath(item: Item): string {
      const dirname = this.dirname(item);
      // touch the file of dirname/metaext.json if not exists
      const metaextPath = path.join(dirname, 'metaext.json');
      if (!fs.existsSync(metaextPath)) {
        fs.writeFileSync(metaextPath, '{}');
      }
      return metaextPath;
    },

    /**
     * Gets the metadata extension for an item.
     * @param item - The Eagle item
     * @returns A MetaExt instance for the item
     */
    metaext(item: Item): MetaExt {
      const metaextPath = this.metaextPath(item);
      const metaext = JSON.parse(fs.readFileSync(metaextPath, 'utf8'));
      return new MetaExt(metaext, metaextPath);
    },

    /**
     * Gets the metafile path for an item if it exists.
     * @param item - The Eagle item
     * @returns The path to the metafile or null if it doesn't exist
     */
    metafilePath(item: Item): string | null {
      const dirname = this.dirname(item);
      const metafile = path.join(dirname, 'metafile');
      if (!fs.existsSync(metafile)) {
        return null;
      }
      return metafile;
    },

    /**
     * Gets the library path for an item.
     * @param item - The Eagle item
     * @returns The path to the library containing the item
     */
    libraryPath(item: Item): string {
      const dirname = this.dirname(item);
      return path.dirname(path.dirname(dirname));
    },
  };

  /**
   * Gets the library configuration for the current Eagle library.
   * @returns A LibraryConfig instance
   */
  static libraryConfig(): LibraryConfig {
    const libraryPath = eagle.library.path;
    return LibraryConfig.fromLibraryPath(libraryPath);
  }

  /**
   * Gets the folder configuration for a specific folder.
   * @param folder - The folder or folder ID to get configuration for
   * @returns A FolderConfig instance
   */
  static folderConfig(folder: Folder | string): FolderConfig {
    const config = LibraryConfig.fromLibraryPath(eagle.library.path);
    return config.folderConfig(folder);
  }

  /**
   * Gets the path to the application configuration file.
   * @returns Promise resolving to the configuration file path
   */
  static async appConfigPath(): Promise<string> {
    const configPath = path.join(
      await eagle.app.getPath('userData'),
      'metaext.json'
    );
    return configPath;
  }

  /**
   * Gets or creates the application configuration.
   * @returns Promise resolving to an AppConfig instance
   */
  static async appConfig(): Promise<AppConfig> {
    const configPath = await this.appConfigPath();
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, '{}');
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return new AppConfig(config, configPath);
  }

  /**
   * Gets or creates the plugin configuration.
   * @param plugin - The plugin object containing the path
   * @returns Promise resolving to a MetaExt instance
   */
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
