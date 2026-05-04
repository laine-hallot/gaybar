{
  description = "My Awesome Desktop Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      ags,
    }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      pname = "gaybar";
      entry = "app.ts";

      astalPackages = with ags.packages.${system}; [
        io
        apps
        astal4 # or astal3 for gtk3
        wireplumber
        bluetooth
        powerprofiles
        notifd
        tray
        battery
        wireplumber
        network
        mpris
        hyprland
      ];

      extraPackages = astalPackages ++ [
        pkgs.libadwaita
        pkgs.libsoup_3
      ];
    in
    {
      packages.${system} = {
        default = pkgs.buildNpmPackage (finalAttrs: {
          name = pname;
          pname = pname;
          src = ./.;

          nodejs = pkgs.nodejs_24;

          nativeBuildInputs = with pkgs; [
            wrapGAppsHook3
            gobject-introspection
            ags.packages.${system}.default
            nodejs_24
            jq
          ];

          buildInputs = extraPackages ++ [
            pkgs.gjs
          ];

          preConfigure = ''
            cp -r --no-preserve=mode,ownership ${ags.packages.${system}.agsFull}/share/ags/js ./libs/ags
            cp -r --no-preserve=mode,ownership ${ags.packages.${system}.agsFull}/share/ags/js/node_modules/gnim ./libs/gnim

            jq -r 'del(.devDependencies)' libs/gnim/package.json > libs/gnim/package.json
          '';

          npmDepsFetcherVersion = 2;
          npmDepsHash = "sha256-JzjP3UoAyFKWCdi7p/gcDxCgNckGNvFDmwHAPhWDR5Q=";

          installPhase = ''
            runHook preInstall
            mkdir -p $out/share/${pname}
            cp -r --no-preserve=mode,ownership . $out/share/${pname}
            rm -f $out/share/${pname}/result
            runHook postInstall
          '';

          buildPhase = ''
            runHook preBuild
            mkdir -p $out/bin
            ags bundle ${entry} $out/bin/${pname} -d "SRC='$out/share'"
            runHook postBuild
          '';
        });
      };

      devShells.${system} = {
        default = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_24
            pkgs.just
            pkgs.watchexec
            pkgs.concurrently
            ags.packages.${system}.agsFull
          ];
          shellHook = ''
            rm -rf libs/ags
            rm -rf libs/gnim
            cp -r --no-preserve=mode,ownership ${ags.packages.x86_64-linux.agsFull.outPath}/share/ags/js ./libs/ags
            cp -r --no-preserve=mode,ownership "${ags.packages.x86_64-linux.agsFull.outPath}/share/ags/js/node_modules/gnim" ./libs/gnim

            jq -r 'del(.devDependencies)' libs/gnim/package.json > libs/gnim/package.json

            just type-gen
            echo "Astal Environment Initialized"
          '';

        };
      };
    }
    // {
      homeManagerModules = {
        gaybar = import ./home-manager.nix {
          gaybar-package = self.packages.${system}.default;
        };
        default = self.homeManagerModules.gaybar;
      };
    };
}
