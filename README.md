# Example

## Launch

```bash
docker compose up
```

App will be accessible on port 8080

### Launch development environment

In `vscode` use the task labeled `dev`.

### Launch in debug mode

TODO, WIP

## Using workspaces

Most commands can be launched for each workspace by using `--workspaces|-ws`

Examples:

```bash
npm i --workspaces
npm ci -ws
npm run build -ws --if-present
npm run test -ws --if-present
npm run clean -ws --include-workspace-root --if-present
```

Or in a specific workspace

```bash
npm i --workspace=backend
npm ci -w=backend --omit=dev
npm run start --workspace=backend
```

Use auto-reload with
