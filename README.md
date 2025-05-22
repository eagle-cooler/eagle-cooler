# @eagle-cooler/util

[![npm version](https://badge.fury.io/js/%40eagle-cooler%2Futil.svg)](https://badge.fury.io/js/%40eagle-cooler%2Futil)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A comprehensive utility library for Eagle plugin and extension development, providing essential tools for metadata management, API integration, and Eagle logic abstraction.

## Features

- **Metadata Management**

  - Item-level metadata handling
  - Library-level configuration
  - Folder-specific settings
  - Application-wide configuration
  - Plugin configuration support

- **Eagle API Integration**

  - Comprehensive API client
  - Token-based authentication
  - Type-safe API methods
  - Error handling
  - Request/response processing

- **Eagle Logic Abstraction**

  - Independent Eagle logic wrapper
  - Folder management
  - Tag management
  - Metadata handling
  - File operations

- **File System Operations**
  - Path resolution utilities
  - File existence checks
  - Automatic file creation
  - JSON file handling
  - Type-safe file operations

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

### Eagle API Integration

```typescript
import { WebApi } from '@eagle-cooler/util';

// Application info
const appInfo = await WebApi.application.info();

// Folder operations
const folder = await WebApi.folder.create('New Folder');
await WebApi.folder.rename(folder.id, 'Renamed Folder');

// Item operations
await WebApi.item.update({
  itemId: 'item-id',
  tags: ['tag1', 'tag2'],
  annotation: 'Note',
  star: true,
});

// Library operations
const libraryInfo = await WebApi.library.info();
await WebApi.library.switch('/path/to/library');
```

### Eagle Logic Wrapper

```typescript
import { EagleWrapover } from '@eagle-cooler/util';

// Create wrapper instance
const wrapper = new EagleWrapover('/path/to/library');

// Access metadata
const metadata = wrapper.metadata;
const folder = metadata.getFolderById('folder-id');
const tagsGroup = metadata.getTagsGroupByName('group-name');
```

## Development

### Prerequisites

- Node.js >=12.0
- npm or yarn
- Git
- Eagle application

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

2. **WebAPI Class**

   - Eagle API client implementation
   - Token management and authentication
   - Type-safe API methods
   - Error handling and response processing

3. **EagleWrapover**

   - Independent Eagle logic implementation
   - Folder and tag management
   - Metadata handling
   - File system operations

4. **Utility Classes**
   - File system operations
   - Type definitions
   - Common utilities
   - Helper functions

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
