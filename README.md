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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
