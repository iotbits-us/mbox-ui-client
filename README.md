# ModbusBox Client Library

![NPM Version](https://img.shields.io/npm/v/@iotbits-io/mbox-ui-client?style=flat-square)

ModbusBox Client Library for device monitor and control across applications.

## Installation

```bash
npm install @iotbits-io/mbox-ui-client
```

Or using yarn:

```bash
yarn add @iotbits-io/mbox-ui-client
```

## Features

- API for ModbusBox interactions
- Support for Web and Node.js environments
- Built-in utilities for common tasks

## Usage

### Import the library

In a JavaScript/TypeScript file, import the library:

```javascript
import { MBoxClient } from '@iotbits-io/mbox-ui-client';
```

### Example

```javascript
const deviceIp = "192.168.4.1"

const client = new MBoxClient(deviceIp);

// Subscribes to host status updates.
client.onHostStatusUpdate((status) => {
    console.log(status);
});

// Subscribes to host error messages
client.onHostError((error) => {
    console.log(error);
});

// Flash LED to locate device
await client.locate();
 
// Get Host Info 
const hostInfo = await client.getHostInfo();
console.log(hostInfo);

```

## API Documentation

For more details on the API, check the [API Documentation](https://iotbits-us.github.io/mbox-ui-client/).

## Development

To build the library:

```bash
npm run build
```

To generate documentation:

```bash
npm run docs
```

## Release

To release a new version of this project, simply push your commits to the `main` branch or merge a pull request. The GitHub Actions workflow will automatically trigger [Semantic Release](https://semantic-release.gitbook.io/semantic-release/v/beta/), which will analyze your commit messages to determine the type of version bump needed (major, minor, or patch). The new version will then be automatically published to NPM, and a corresponding GitHub Release will be created, complete with auto-generated release notes. Ensure your commit messages adhere to [Angular Commit Message Conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines) to take full advantage of this feature.

- **Patch**: For fixes (`fix:`)
- **Minor**: For new features (`feat:`)
- **Major**: For breaking changes (`BREAKING CHANGE:`)

```markdown
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|
  │                          elements|forms|http|language-service|localize|platform-browser|
  │                          platform-browser-dynamic|platform-server|router|service-worker|
  │                          upgrade|zone.js|packaging|changelog|docs-infra|migrations|
  │                          devtools
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
