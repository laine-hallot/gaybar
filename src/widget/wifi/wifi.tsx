import { Gtk } from 'ags/gtk4';
import AstalNetwork from 'gi://AstalNetwork';

import { Accessor, For, createBinding, With, createComputed } from 'ags';
import { execAsync } from 'ags/process';

const astalNetwork = AstalNetwork.get_default();
import { WifiToggle } from './wifi-toggle';
import { NetworkEntry } from './network-entry';
import Gio from 'gi://Gio?version=2.0';
import { NetworkList } from './network-list';

type NetInfo = {
  wired: boolean;
  strength: number;
};

const networkIcon = (info: NetInfo) => {
  if (info.wired) {
    return 'mynaui-arrow-up-down-symbolic';
  } else {
    if (info.strength >= 90) return 'mynaui-wifi-symbolic';
    // even though the battery is not charging the icon names still start with "battery-charging"
    if (info.strength >= 70) return 'mynaui-wifi-medium-symbolic';
    if (info.strength >= 30) return 'mynaui-wifi-low-symbolic';
    return 'mynaui-wifi-empty-symbolic';
  }
};

export const Wifi = () => {
  const wifi = createBinding(astalNetwork, 'wifi');
  const wired = createBinding(astalNetwork, 'wired');

  const wifiWired = createComputed(() => [wifi(), wired()] as const);

  return (
    <box class="widget wifi">
      <With value={wifiWired}>
        {([wifi, wired]) => {
          const wifiEnabled = createBinding(wifi, 'enabled');

          return (
            <menubutton class="widget-menubutton wifi">
              <Gtk.Picture
                $type="svg"
                class="wifi-icon"
                file={Gio.File.new_for_path(
                  `/home/laineh/Projects/astal-bar/icons/hicolor/scalable/actions/${networkIcon({
                    strength: wifi.strength,
                    wired: false,
                  })}.svg`,
                )}
              />
              <popover class="styled-popover" hasArrow={false} widthRequest={340}>
                <box orientation={Gtk.Orientation.VERTICAL}>
                  <With value={wifiEnabled}>
                    {(wifiEnabled) => (
                      <box orientation={Gtk.Orientation.VERTICAL}>
                        <WifiToggle wifiEnabled={wifiEnabled} />
                        <NetworkList wifiEnabled={wifiEnabled} wifi={wifi} />
                        <Gtk.Separator />
                        <NetworkSettings />
                      </box>)}
                  </With>
                </box>
              </popover>
            </menubutton>
          )
        }}
      </With>
    </box>
  );
};

const NetworkSettings = () => {
  async function openSettings() {
    // connecting to ap is not yet supported
    // https://github.com/Aylur/astal/pull/13
    try {
      await execAsync(
        "/usr/bin/env bash -c 'export XDG_CURRENT_DESKTOP=gnome && gnome-control-center'",
      );
    } catch (error) {
      // you can implement a popup asking for password here
      console.error(error);
    }
  }

  return (
    <box class="network-settings" hexpand={true} orientation={Gtk.Orientation.VERTICAL}>
      <button onClicked={openSettings} halign={Gtk.Align.BASELINE_FILL} hexpand={true}>
        <label label={"Open Settings"} halign={Gtk.Align.START} />
      </button>
    </box>
  );
};
