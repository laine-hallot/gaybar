import app from 'ags/gtk4/app';
import { Astal, Gtk, Gdk } from 'ags/gtk4';
import { BatteryWidget } from './widget/battery';
import { HyprlandDesktops } from './widget/hyprland-desktops';
import { HyprlandWindow } from './widget/hyprland-window';
import { SystemTray } from './widget/tray';
import { DateTime } from './widget/date-time';
import { Wifi } from './widget/wifi/wifi';
import { Audio } from './widget/audio/audio';
import { Mpris } from './widget/mpris';

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <box $type="start" class="bar-start">
          <HyprlandWindow />
        </box>
        <box $type="center">
          <HyprlandDesktops />
        </box>
        <box $type="end" halign={Gtk.Align.END} class="bar-end">
          <SystemTray />
          { /* <Mpris /> */}
          <BatteryWidget />
          <Wifi />
          <Audio />
          <DateTime />
        </box>
      </centerbox>
    </window>
  );
}
