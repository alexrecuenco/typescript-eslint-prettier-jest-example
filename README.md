# Example

In order do as follows

## Setup

### Docker

1. Copy `dbpass.txt.example` to `dbpass.txt` and set a password
2. Copy `password-file.txt.example` to `password-file.txt` and set the same password


### Local

1. Install **node 22**
2. Run `npm install`


## Local Development

### Build

Only required for local development

```bash
npm run build -ws
```

### Test

```bash
npm run test -ws
```

### Prepare database

```bash
# at a separate terminal run this and keep running
docker compose -f compose.yaml -f compose.debug.yaml up db
# In a separate terminal, (I believe postgresql does this automatically)
npm run db:prepare -w backend
```

### Launch

### Hot-reload mode

In `vscode` use the task labeled `dev`.

In the terminal you want to open two terminals, opening a database and the development environment

```bash
# Then keep this process running
npm run dev
```

Clean resources

```bash
docker compose -f compose.yaml -f compose.debug.yaml down -v db
npm run clean -ws --if-present
```

Access `http://localhost:3000/tasks/debug/populate` to populate a few tasks (or click the populate button)

## Docker *deployment*

```bash
docker compose up
```

App will be accessible on port 8080

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
