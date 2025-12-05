# ease-axios

`ease-axios` is a lightweight wrapper for [axios](https://axios-http.com/) designed to simplify and standardize HTTP requests in web applications. It provides a configurable instance creator, includes common request methods, and supports interceptors for pre-request and post-response processing, allowing you to focus more on your business logic.

## Installation

```bash
npm install ease-axios
```

> **Note**: `axios` is a `peerDependency` of `ease-axios`, so you need to install it alongside.

## Quick Start

Here is a simple example of creating an instance and making a `GET` request:

```javascript
import easeAxios from 'ease-axios';

// 1. Create a request instance
const api = easeAxios.create({
  baseURL: 'https://api.example.com',
  timeout: 15000, // Optional, defaults to 10000
  headers: {
    'X-Custom-Header': 'foobar'
  }
});

// 2. Use the instance to make a request
async function fetchUserData(userId) {
  try {
    const userData = await api.get(`/users/${userId}`);
    console.log(userData);
  } catch (error) {
    console.error('Request failed:', error);
  }
}

fetchUserData('123');
```

## API

### `create(config)`

This is the only method exposed by `ease-axios`. It creates an `axios` instance and returns an object containing several methods.

#### `config` Parameters

The `create` method accepts a configuration object with the following main parameters:

| Parameter         | Type       | Required | Description                                                                                                                            |
| ----------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `baseURL`         | `string`   | **Yes**  | The base URL for the API, e.g., `https://api.example.com/v1`.                                                                          |
| `timeout`         | `number`   | No       | Request timeout in milliseconds. Defaults to `10000`.                                                                                  |
| `headers`         | `object`   | No       | Custom request headers. These will be merged with the default `{'Content-Type': 'application/json'}`.                                  |
| `beforeRequest`   | `function` | No       | **Request Interceptor**. Executes before each request is sent. It receives the `config` object, which you can modify (e.g., to add a token). |
| `afterResponse`   | `function` | No       | **Response Interceptor**. Executes after a successful response is received. It receives the `response` object. By default, the library returns `response.data`; this function can override that behavior. |
| `onResponseError` | `function` | No       | **Error Handling Interceptor**. Executes when a request fails. It receives the `error` object.                                         |

#### Return Value

The `create` method returns an object with the following properties and methods:

- `instance`: The original `axios` instance, which can be used for more advanced scenarios.
- `get(url, params, config)`
- `post(url, data, config)`
- `put(url, data)`
- `del(url, params)`
- `upload(url, data, config)`

### Instance Methods

#### `get(url, params, config)`

Makes a `GET` request.

- `url` (`string`): The request path.
- `params` (`object`, optional): URL query parameters.
- `config` (`object`, optional): Specific `axios` configuration for this single request.

```javascript
// GET /users?id=123
api.get('/users', { id: 123 });
```

#### `post(url, data, config)`

Makes a `POST` request.

- `url` (`string`): The request path.
- `data` (`object`, optional): The request body data.
- `config` (`object`, optional): Specific `axios` configuration for this single request.

```javascript
api.post('/users', { name: 'John Doe' });
```

#### `put(url, data)`

Makes a `PUT` request.

- `url` (`string`): The request path.
- `data` (`object`, optional): The request body data.
- `config` (`object`, optional): Specific `axios` configuration for this single request.

```javascript
api.put('/users/123', { name: 'Jane Doe' });
```

#### `del(url, params)`

Makes a `DELETE` request.

- `url` (`string`): The request path.
- `params` (`object`, optional): URL query parameters to specify the resource to delete.
- `config` (`object`, optional): Specific `axios` configuration for this single request.

```javascript
// DELETE /users/123
api.del('/users/123');

// DELETE /comments?postId=1
api.del('/comments', { postId: 1 });
```

#### `upload(url, data, config)`

Used for file uploads. This method automatically converts the `data` object into `FormData`.

- `url` (`string`): The upload path.
- `data` (`object`): An object containing files and other fields. `Blob` or `File` objects are handled correctly.
- `config` (`object`, optional): Specific `axios` configuration for this single request.

```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// Upload a file with additional data
api.upload('/upload', {
  file: file,
  description: 'This is a profile picture'
});
```

## Advanced Usage

### Using Interceptors

Interceptors are a powerful feature of `ease-axios`, allowing you to inject custom logic into the request and response lifecycle.

#### `beforeRequest` (Request Interception)

A common use case is to dynamically add an authentication `token` to the request headers.

```javascript
const api = easeAxios.create({
  baseURL: 'https://api.example.com',
  beforeRequest: (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
});
```

#### `afterResponse` (Response Interception)

You can use this to uniformly handle the data structure returned by your backend. For example, if your API always returns the actual content in a `data` field:

```javascript
const api = easeAxios.create({
  baseURL: 'https://api.example.com',
  afterResponse: (response) => {
    // Assuming the API returns { code: 0, message: 'success', data: { ... } }
    const res = response.data;
    if (res.code !== 0) {
      // Handle business errors centrally
      console.error(res.message);
      return Promise.reject(new Error(res.message));
    }
    // Return only the core data
    return res.data;
  }
});
```

#### `onResponseError` (Error Handling)

Used to globally catch and handle HTTP errors, such as a 401 Unauthorized status.

```javascript
const api = easeAxios.create({
  baseURL: 'https://api.example.com',
  onResponseError: (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // For example, redirect to the login page
        console.log('Authentication failed, please log in again.');
        window.location.href = '/login';
      }
    } else {
      // Network error or other issues
      console.error('Request Error:', error.message);
    }
    // The error must be re-thrown so it can be caught by the business logic's catch block
    return Promise.reject(error);
  }
});
```

## License

[Apache License](./LICENSE)
