After cloning, `npm install` to download and install needed npm packages.

Once installed, `npm run dev -- --config-pack` will compile the code, styles, and compendium packs and produce the distribution files in `./build/bkit`, which can be symlinked into your foundry data folder under `./modules`.
* `npm run dev -- -w` will compile code and styles and enter watch mode for updates to either. Styles are hotreloaded, code requires full reload.
* `npm run dev -- --config-unpack only` will _extract_ the LevelDB compendiums into plaintext files for versioning (no code/style compilation), `--config-pack only` does the inverse, but plaintext -> leveldb
