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
      pname = "neat-astal-bar";
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
        default = pkgs.stdenv.mkDerivation {
          name = pname;
          src = ./.;

          nativeBuildInputs = with pkgs; [
            wrapGAppsHook3
            gobject-introspection
            ags.packages.${system}.default
          ];

          buildInputs = extraPackages ++ [
            pkgs.gjs
            pkgs.nodejs_24
          ];

          installPhase = ''
            runHook preInstall

            mkdir -p $out/bin
            mkdir -p $out/share
            cp -r * $out/share

            rm -rf $out/share/result

            ags bundle ${entry} $out/bin/${pname} -d "SRC='$out/share'"

            runHook postInstall
          '';
        };
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

            just type-gen
            echo "Astal Environment Initialized"
          '';

        };
      };
    }
    // {
      homeManagerModules = {
        neat-astal-bar = import ./home-manager.nix {
          neat-astal-bar-package = self.packages.${system}.default;
        };
        default = self.homeManagerModules.neat-astal-bar;
      };
    };
}
