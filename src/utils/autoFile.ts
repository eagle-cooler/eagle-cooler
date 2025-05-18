import * as fs from 'fs';
import * as path from 'path';

export abstract class AutoRefreshFile<T> {
  protected static instances: Map<string, any> = new Map();
  protected data: T | null = null;
  protected lastModified = 0;
  protected filePath: string;

  protected constructor(filePath: string) {
    this.filePath = filePath;
    this.refresh();
  }

  public static from<T extends AutoRefreshFile<any>>(
    this: new (filePath: string) => T,
    filePath: string
  ): T {
    const absolutePath = path.resolve(filePath);
    if (!AutoRefreshFile.instances.has(absolutePath)) {
      AutoRefreshFile.instances.set(absolutePath, new this(absolutePath));
    }
    return AutoRefreshFile.instances.get(absolutePath) as T;
  }

  protected abstract parseData(content: string): T;

  public getData(): T {
    this.checkAndRefresh();
    if (!this.data) {
      throw new Error('Data not initialized');
    }
    return this.data;
  }

  protected checkAndRefresh(): void {
    try {
      const stats = fs.statSync(this.filePath);
      if (stats.mtimeMs > this.lastModified) {
        this.refresh();
      }
    } catch (error) {
      console.error(`Error checking file ${this.filePath}:`, error);
    }
  }

  protected refresh(): void {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      this.data = this.parseData(content);
      const stats = fs.statSync(this.filePath);
      this.lastModified = stats.mtimeMs;
    } catch (error) {
      console.error(`Error refreshing file ${this.filePath}:`, error);
    }
  }
}

export class JsonFile<
  T extends Record<string, unknown>
> extends AutoRefreshFile<T> {
  protected parseData(content: string): T {
    try {
      return JSON.parse(content) as T;
    } catch (error) {
      console.error(`Error parsing JSON file ${this.filePath}:`, error);
      throw new Error(`Invalid JSON format in file ${this.filePath}`);
    }
  }

  public async write(data: T): Promise<void> {
    try {
      const content = JSON.stringify(data, null, 2);
      await fs.promises.writeFile(this.filePath, content, 'utf-8');
      this.data = data;
      const stats = await fs.promises.stat(this.filePath);
      this.lastModified = stats.mtimeMs;
    } catch (error) {
      console.error(`Error writing to JSON file ${this.filePath}:`, error);
      throw new Error(`Failed to write to file ${this.filePath}`);
    }
  }
}
