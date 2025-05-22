# @eagle-cooler/util

[![npm version](https://badge.fury.io/js/%40eagle-cooler%2Futil.svg)](https://badge.fury.io/js/%40eagle-cooler%2Futil)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A comprehensive utility library for Eagle plugin and extension development, providing essential tools for metadata management, configuration handling, and file system operations.

## Features

- **Metadata Management**

  - Item-level metadata handling
  - Library-level configuration
  - Folder-specific settings
  - Application-wide configuration
  - Plugin configuration support

- **Configuration Management**

  - JSON-based configuration storage
  - Type-safe configuration interfaces
  - Hierarchical configuration structure
  - Automatic file creation and updates

- **File System Operations**
  - Path resolution utilities
  - File existence checks
  - Automatic file creation
  - JSON file handling

## Installation

```bash
npm install @eagle-cooler/util
```

## Usage

### Metadata Management

```typescript
import { Meta } from '@eagle-cooler/util';

// Get item metadata
const itemMeta = Meta.item.metaext(item);
itemMeta.content.customField = 'value';
itemMeta.save();

// Get library configuration
const libraryConfig = Meta.libraryConfig();
const folderConfig = libraryConfig.folderConfig(folderId);

// Get application configuration
const appConfig = await Meta.appConfig();
const scopeConfig = appConfig.scope('myScope');
```

### Configuration Management

```typescript
import { Meta } from '@eagle-cooler/util';

// Library configuration
const libraryConfig = Meta.libraryConfig();
libraryConfig.config.settings = { theme: 'dark' };
libraryConfig.save();

// Folder configuration
const folderConfig = Meta.folderConfig(folderId);
folderConfig.config.customSettings = { enabled: true };
folderConfig.save();

// Application configuration
const appConfig = await Meta.appConfig();
const scopeConfig = appConfig.scope('myPlugin');
scopeConfig.settings = { version: '1.0.0' };
appConfig.save();
```

## Development

### Prerequisites

- Node.js >= 12.0
- npm or yarn
- Git

### Setup

1. Clone the repository:

```bash
git clone https://github.com/eagle-cooler/eagle-cooler.git
cd eagle-cooler
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Run tests:

```bash
npm test
```

### Development Commands

- `npm run build` - Build the project
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run typecheck` - Type checking
- `npm run cm` - Create a conventional commit

## Documentation

For detailed documentation, please visit our [documentation site](https://eagle-cooler.github.io/docs).

### Key Concepts

1. **Meta Class**

   - Main entry point for metadata management
   - Provides item, library, and application-level operations
   - Handles file system interactions

2. **Configuration Classes**

   - `LibraryConfig`: Library-level settings
   - `FolderConfig`: Folder-specific configurations
   - `AppConfig`: Application-wide settings
   - `MetaExt`: Metadata extension handling

3. **File System Operations**
   - Automatic file creation
   - Path resolution
   - JSON persistence
   - Error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`npm run cm`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Use conventional commits
- Follow the code style guide

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Based on [typescript-npm-package-template](https://github.com/ryansonshine/typescript-npm-package-template/)
- Inspired by Eagle's plugin ecosystem
- Built with TypeScript and modern JavaScript practices
