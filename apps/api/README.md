# IrvineHacks Site API

This "app" contains the source code for the backend API used by the site.

## Local Development

For local development, run

```shell
python src/dev.py
```

which will start a Uvicorn server with auto-reload.

## Deployment Configuration

For deployment, the following environment variables need to be set:

-   `PYTHONPATH=src/api` to properly import Python modules
