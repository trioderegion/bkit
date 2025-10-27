After cloning, `npm install` to download and install needed npm packages.

Once installed, `npm run portable` will compile the code and styles and produce the distribution files in `./portable/bkit`, which can be symlinked into your foundry data folder under `./modules`.
* `npm run portable -- -w` will compile code and styles and enter watch mode for updates to either. Styles are hotreloaded, code requires full reload.
