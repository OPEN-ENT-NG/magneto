# App Frontend

## Install

### With Docker

Install all dependencies.

```bash
./build.sh initDev

# alternatively
./build.sh installDeps
```

### Without Docker

Install all dependencies.

```bash
./build-noDocker.sh initDev
```

or

```bash
node scripts/package.js && yarn install
```

## Dev

### Start project

Open your project with Vite Server + HMR at <http://localhost:4200>.

```bash
yarn dev

# with docker
./build.sh runLocal
```

### Troubleshoot "runLocal" 

```
Emitted 'error' event on FSWatcher instance at:
    at FSWatcher._handleError (file:///home/node/app/node_modules/.pnpm/vite@4.4.11_@types+node@20.8.5_sass@1.69.5/node_modules/vite/dist/node/chunks/dep-2b82a1ce.js:53792:10)
    at NodeFsHandler._addToNodeFs (file:///home/node/app/node_modules/.pnpm/vite@4.4.11_@types+node@20.8.5_sass@1.69.5/node_modules/vite/dist/node/chunks/dep-2b82a1ce.js:52609:18) {
  errno: -28,
  syscall: 'watch',
  code: 'ENOSPC',
  path: '/home/node/app/.pnpm-store/v3/files/24/878cfc89bd0f0eab2c8fdfd08c240c94d8fb85da1427fe474e18d6c883ce78c8d27bd441ce38996a533a97f46e6cc58b532ab613831353b56b88f42c0cddf9',
  filename: '/home/node/app/.pnpm-store/v3/files/24/878cfc89bd0f0eab2c8fdfd08c240c94d8fb85da1427fe474e18d6c883ce78c8d27bd441ce38996a533a97f46e6cc58b532ab613831353b56b88f42c0cddf9'
}
```

```
# increase limit for number of file watchers reached
sudo sysctl -w fs.inotify.max_user_watches=100000
```

### [Server Options](https://vitejs.dev/config/server-options.html)

You can change Vite Server by editing `vite.config.ts`

```bash
server: {
  host: "0.0.0.0",
  port: 4200,
  open: true // open the page on <http://localhost:4200> when dev server starts.
}
```

### Lint

```bash
yarn lint

# fix missing eslint
./build.sh lintFixDocker
```

### Prettier

```bash
yarn format

# fix missing prettier
./build.sh prettierDocker
```

### Global check eslint and prettier

```bash
./build.sh checkQualityCode
```

### Pre-commit

When committing your work, `pre-commit` will start `yarn lint-staged`:

> lint-staged starts lint + prettier

```bash
yarn pre-commit
```

## Build

TypeScript check + Vite Build

```bash
yarn build
```

## Preview

```bash
yarn preview
```

## License

This project is licensed under the AGPL-3.0 license.
