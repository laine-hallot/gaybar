import { Gtk } from 'ags/gtk4';
import AstalNetwork from 'gi://AstalNetwork';

import { Accessor, For, createConnection, createBinding, With } from 'ags';
import { execAsync, createSubprocess, exec } from 'ags/process';

const astalNetwork = AstalNetwork.get_default();
import { WifiToggle } from './wifi-toggle';
import { NetworkEntry } from './network-entry';

type NetInfo = {
  isPresent: boolean;
  charging: boolean;
  strength: number;
};

const networkIcon = (info: NetInfo) => {
  const statusType = (() => {
    console.log(info.strength);
    if (!info.isPresent) {
      return 'x';
    }
    if (info.charging) {
      return 'charging';
    } else {
      if (info.strength >= 90) return '';
      // even though the battery is not charging the icon names still start with "battery-charging"
      if (info.strength >= 70) return 'medium';
      if (info.strength >= 30) return 'low';
      return 'empty';
    }
  })();
  return `mynaui-wifi-${statusType}-symbolic`;
};

export const Wifi = () => {
  const wifi = createBinding(astalNetwork, 'wifi');
  const wired = createBinding(astalNetwork, 'get_wired');

  const sorted = (arr: Array<AstalNetwork.AccessPoint>) => {
    return arr
      .filter((ap) => !!ap.ssid)
      .sort((a, b) => b.strength - a.strength);
  };

  return (
    <box>
      <With value={wired}>
        {(wired) => (
          <box>
            <With value={wifi}>
              {(wifi) =>
                wifi && (
                  <menubutton>
                    <image
                      iconName={networkIcon({
                        strength: wifi.strength,
                        charging: wired !== null ? wired.state : false,
                        isPresent: true,
                      })}
                      class="wifi-icon"
                    />
                    <popover>
                      <box orientation={Gtk.Orientation.VERTICAL}>
                        <WifiToggle />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                          <For
                            each={createBinding(wifi, 'accessPoints')(sorted)}
                          >
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
                )
              }
            </With>
          </box>
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

  return <button onClicked={openSettings}>Open Settings</button>;
};
