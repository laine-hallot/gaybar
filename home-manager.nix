{ gaybar-package }:
{
  config,
  pkgs,
  lib,
  ...
}:
let
  cfg = config.programs.gaybar;
in
{
  options.programs.gaybar = with lib.types; {
    enable = lib.mkEnableOption "gaybar";
    #package = lib.mkPackageOption pkgs "gaybar" { };

    systemd = {
      enable = lib.mkEnableOption "Systemd integration";

      target = lib.mkOption {
        type = str;
        default = config.wayland.systemd.target;
        defaultText = literalExpression "config.wayland.systemd.target";
        example = "sway-session.target";
        description = ''
          The systemd target that will automatically start the gaybar service.

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
        systemd.user.services.gaybar = {
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
            ExecStart = "${gaybar-package}/bin/gaybar";
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
