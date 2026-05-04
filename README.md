# Gay Bar
Gtk4 status bar made with Astal.

![example](https://raw.githubusercontent.com/laine-hallot/gaybar/refs/heads/main/docs/public/bar-example.png)

### Widgets
| Audio | Network | Battery |
| -- | -- | -- |
| ![audio](https://raw.githubusercontent.com/laine-hallot/gaybar/refs/heads/main/docs/public/volume.png) | ![network](https://raw.githubusercontent.com/laine-hallot/gaybar/refs/heads/main/docs/public/network.png) | ![battery](https://raw.githubusercontent.com/laine-hallot/gaybar/refs/heads/main/docs/public/battery.png) |


## Installation

### NixOs
I use home manager so this assumes you do too.
```nix
# flake.nix
{
  inputs = {
    # ...the rest of your inputs
  
    gaybar = {
      url = "github:laine-hallot/gaybar";
    };
  };
  outputs = { 
    self,
    nixpkgs,
    home-manager,
    ... 
  }@inputs:
  {
    nixosConfigurations.<name> = nixpkgs.lib.nixosSystem {
      # ...
      modules = [
        # ...
        home-manager.nixosModules.home-manager
        {
          # ...
          home-manager.users.<user> = {
            imports = [
              # ...rest of your home-manager imports
              inputs.gaybar.homeManagerModules.gaybar
            ];
          };
        }
      ];
    }
  };
}
```

```nix
# your home-manager config
programs.gaybar = {
  enable = true;
  systemd.enable = true;
};
```

### Other Linux
You'll have to build this bar from source since I haven't set up a way to distribute binaries.
#### Deps
I recommend installing the `nix` package manager and then running `nix develop` to use the devShell defined in `flake.nix` which should install all the deps for you.

If you really don't want to use `nix` for some reason then you'll need to install the following:
- just
- Node 24 (if you have nvm just `cd` into the project directory and run `nvm use`)
- watchexec
- concurrently
- Gtk4 dev package
- Lib Adwaita dev packages
- libsoup_3
- probably some other stuff

Because of how `ags` and `gnim` are packaged you need to download the files for those and add them to `./node_modules/` yourself. `package.json` has `ags` and `gnim` as `file:` dependencies pointed at `./libs/ags` and `./libs/gnim` respectively. Regardless of how you actually get the files as long as your `./libs/` looks something like this things should work out:

![libs](https://raw.githubusercontent.com/laine-hallot/gaybar/refs/heads/main/docs/public/libs-example.png)

#### Building
1. Correct some broken deps inside `gnim` `jq -r 'del(.devDependencies)' libs/gnim/package.json > libs/gnim/package.json`
1. `npm i`
1. `just build`

Now you should have an executable at `./result/bin/gaybar` and can create a symlink to that in your preferred `bin` directory. Heres a template for a systemd service since you'll probably want that to actually run the bar
```
[Install]
WantedBy=graphical-session.target
WantedBy=tray.target

[Service]
Environment=
ExecStart=/path/to/your/projects/gaybar/result/bin/gaybar
KillMode=mixed
Restart=on-failure

[Unit]
After=graphical-session.target
ConditionEnvironment=WAYLAND_DISPLAY
Description=Astal status bar
Documentation=
PartOf=graphical-session.target
PartOf=tray.target
```
