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

  const createSorter = (connectedAp: AstalNetwork.AccessPoint) => (arr: Array<AstalNetwork.AccessPoint>) => {
    return Object.values(arr
      .filter((ap) => !!ap.ssid)
      .reduce((apList, ap) => {
        const ssid = ap.get_ssid();
        if (ssid === null) {
          return apList;
        }
        const existing = apList[ssid];
        if (existing === undefined) {
          return {
            ...apList,
            ...({ [ssid]: ap })
          }
        } else if (ap.strength > existing.strength) {
          return {
            ...apList,
            ...({ [ssid]: ap })
          }
        } else if (ap.ssid === connectedAp.ssid) {
          return {
            ...apList,
            ...({ [ssid]: ap })
          }
        }
        return apList;

      }, {} as Record<string, AstalNetwork.AccessPoint>))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 16);
  };

  const wifiWired = createComputed(() => [wifi(), wired()] as const);
  return (
    <box class="widget wifi">
      <With value={wifiWired}>
        {([wifi, wired]) => (
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
                <WifiToggle />
                <Gtk.Separator />
                <box orientation={Gtk.Orientation.VERTICAL} class="wifi-list option-list">
                  <For each={createBinding(wifi, 'accessPoints')(createSorter(wifi.activeAccessPoint))}>
                    {(ap: AstalNetwork.AccessPoint) => (
                      <NetworkEntry
                        ap={ap}
                        activeAccessPoint={wifi.activeAccessPoint}
                      />
                    )}
                  </For>
                </box>
                <Gtk.Separator />
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
    <box class="network-settings" hexpand={true} orientation={Gtk.Orientation.VERTICAL}>
      <button onClicked={openSettings} halign={Gtk.Align.BASELINE_FILL} hexpand={true}>
        <label label={"Open Settings"} halign={Gtk.Align.START} />
      </button>
    </box>
  );
};
