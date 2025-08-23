## About

Dominion simulator project that does a few things now. More documentation and links to project tracking to come.

This project was created with [express-generator-typescript](https://github.com/seanpmaxwell/express-generator-typescript).

Backend is express/node, frontend is vanilla javascript (sorry, I was just playing around with this at first!).

## Local & Integration Scripts

### `npm run dev`

Run the server locally (in development mode). By default this will be available at localhost:3000/

### `npm test`

Run all unit-tests with hot-reloading.

### `npm run test:no-reloading`

Run all unit-tests without hot-reloading.

### `npm test -- --testFile="name of test file" (i.e. --testFile=workers_village).`

Run a single unit-test.

### npx prettier . --write

Auto-reformat all code

## Production Scripts

### `npm run build`

Build the project for production.

### `npm start`

Run the production build (Must be built first).

### `npm start -- --env="name of env file" (default is production).`

Run production build with a different env file.

## Additional Notes

- If `npm run dev` gives you issues with bcrypt on MacOS you may need to run: `npm rebuild bcrypt --build-from-source`.
