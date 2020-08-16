# Gersang Supporter

Gersang browser + timer + calculator

![main](./screenshots/main.png)

## Prerequisites

- windows-build-tools

## How to Install

1. Install windows-build-tools
2. `yarn`
3. `yarn build:native`
    - build native libraries for electron.

## Development

``` shell
> yarn dev # turn on development server(main[electron], frontend[react]).
> yarn start # execute electron.
```

## Build

``` shell
> yarn build
```

Before execute above, please shutdown any process that related with development, otherwise you will meet file access issues.
