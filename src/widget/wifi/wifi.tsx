import { Gtk } from 'ags/gtk4';
import AstalNetwork from 'gi://AstalNetwork';

import { Accessor, For, createBinding, With, createComputed } from 'ags';
import { execAsync } from 'ags/process';

const astalNetwork = AstalNetwork.get_default();
import { WifiToggle } from './wifi-toggle';
import { NetworkEntry } from './network-entry';
import Gio from 'gi://Gio?version=2.0';

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

  const sorted = (arr: Array<AstalNetwork.AccessPoint>) => {
    return arr
      .filter((ap) => !!ap.ssid)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 16);
  };

  const wifiWired = createComputed(() => [wifi(), wired()] as const);
  return (
    <box class="widget wifi">
      <With value={wifiWired}>
        {([wifi, wired]) => (
          <menubutton class="widget-menubutton">
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
            <popover>
              <box orientation={Gtk.Orientation.VERTICAL}>
                <WifiToggle />
                <box orientation={Gtk.Orientation.VERTICAL} class="wifi-list">
                  <For each={createBinding(wifi, 'accessPoints')(sorted)}>
                    {(ap: AstalNetwork.AccessPoint) => (
                      <NetworkEntry
                        ap={ap}
                        activeAccessPoint={wifi.activeAccessPoint}
                      />
                    )}
                  </For>
                </box>
                <NetworkSettings />
              </box>
            </popover>
          </menubutton>
        )}
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
    <button class="network-settings" onClicked={openSettings}>
      Open Settings
    </button>
  );
};
