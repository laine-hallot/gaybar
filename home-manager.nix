{ neat-astal-bar-package }:
{
  config,
  pkgs,
  lib,
  ...
}:
let
  cfg = config.programs.neat-astal-bar;
in
{
  options.programs.neat-astal-bar = with lib.types; {
    enable = lib.mkEnableOption "neat-astal-bar";
    #package = lib.mkPackageOption pkgs "neat-astal-bar" { };

    systemd = {
      enable = lib.mkEnableOption "Systemd integration";

      target = lib.mkOption {
        type = str;
        default = config.wayland.systemd.target;
        defaultText = literalExpression "config.wayland.systemd.target";
        example = "sway-session.target";
        description = ''
          The systemd target that will automatically start the neat-astal-bar service.

          When setting this value to `"sway-session.target"`,
          make sure to also enable {option}`wayland.windowManager.sway.systemd.enable`,
          otherwise the service may never be started.
        '';
      };
    };
  };
  config = lib.mkIf cfg.enable (
    lib.mkMerge [
      (lib.mkIf cfg.systemd.enable {
        systemd.user.services.neat-astal-bar = {
          Unit = {
            Description = "Astal status bar";
            Documentation = "";
            PartOf = [
              cfg.systemd.target
              "tray.target"
            ];
            After = [ cfg.systemd.target ];
            ConditionEnvironment = "WAYLAND_DISPLAY";
          };

          Service = {
            Environment = "";
            ExecReload = "${pkgs.coreutils}/bin/kill -SIGUSR2 $MAINPID";
            ExecStart = "${neat-astal-bar-package}/bin/neat-astal-bar";
            KillMode = "mixed";
            Restart = "on-failure";
          };

          Install.WantedBy = [
            cfg.systemd.target
            "tray.target"
          ];
        };
      })
    ]
  );
}
