# Running InvokeAI Locally

## Prerequisites

- Python 3.11 or higher
- `pip` (Python package installer)

## Installation

1.  Navigate to the project root.
2.  Install the required dependencies:

    ```bash
    pip install .
    # OR if you want dev dependencies
    pip install ".[dev,test]"
    ```

    If you encounter missing modules like `uvicorn`, ensure you have installed the dependencies.

## Running the Application

To run the application, you need to specify a root directory where InvokeAI will store its database, models, and configuration.

1.  Create a root directory (e.g., `invokeai_root`):

    ```bash
    mkdir invokeai_root
    ```

2.  Run the application using the installed script:

    ```bash
    invokeai-web --root /path/to/invokeai_root
    ```

    Replace `/path/to/invokeai_root` with the absolute path to your created directory.

    Alternatively, you can set the `INVOKEAI_ROOT` environment variable:

    ```bash
    export INVOKEAI_ROOT=/path/to/invokeai_root
    invokeai-web
    ```

## Running in Development Mode

To run with hot-reloading enabled (automatically reloads when python files change):

1.  Ensure you have installed the dev dependencies:
    ```bash
    pip install ".[dev]"
    ```

2.  Run with the `INVOKEAI_DEV_RELOAD` environment variable:
    ```bash
    INVOKEAI_DEV_RELOAD=true invokeai-web --root /path/to/invokeai_root
    ```

## Troubleshooting

### Inotify Instance Limit Reached

If you see `OSError: [Errno 24] inotify instance limit reached` when running in dev mode, you need to increase the inotify limit:

```bash
sudo sysctl fs.inotify.max_user_instances=524288
```

### ModuleNotFoundError

If you see `ModuleNotFoundError: No module named 'uvicorn'`, it means the dependencies are not installed. Please run the pip install command above.
