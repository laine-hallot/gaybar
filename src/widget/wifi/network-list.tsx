import AstalNetwork from "gi://AstalNetwork?version=0.1";
import Gtk from "gi://Gtk?version=4.0";
import { Accessor, For, With, createBinding, createComputed, createMemo } from "ags";
import { NetworkEntry } from "./network-entry";

type AccessPoints = { type: 'empty' } | { type: 'has-networks', values: Accessor<AstalNetwork.AccessPoint[]> }

const useWifiNetworks = (wifi: AstalNetwork.Wifi): { activeAccessPoint: Accessor<AstalNetwork.AccessPoint>, accessPoints: Accessor<AccessPoints> } => {
  const activeAccessPoint = createBinding(wifi, 'activeAccessPoint')
  const accessPointsEntity = createBinding(wifi, 'accessPoints');

  const sorter = createMemo(() => {
    return (arr: Array<AstalNetwork.AccessPoint>) => {
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
              [ssid]: ap
            }
          } else if (ap.strength > existing.strength) {
            return {
              ...apList,
              [ssid]: ap
            }
          } else if (ap.ssid === activeAccessPoint().ssid) {
            return {
              ...apList,
              [ssid]: ap
            }
          }
          return apList;

        }, {} as Record<string, AstalNetwork.AccessPoint>))
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 16);
    }
  });

  const accessPoints = createComputed<AccessPoints>(() => {
    const aps = accessPointsEntity();
    if (aps.length <= 0) {
      return { type: 'empty' };
    } else {
      return { type: 'has-networks', values: accessPointsEntity(sorter()) };
    }
  })

  return { accessPoints, activeAccessPoint }
}

export const NetworkList = ({ wifi, wifiEnabled }: { wifi: AstalNetwork.Wifi, wifiEnabled: boolean }) => {
  const { accessPoints, activeAccessPoint } = useWifiNetworks(wifi);

  return (<box orientation={Gtk.Orientation.VERTICAL} visible={wifiEnabled}>
    <Gtk.Separator />
    <box orientation={Gtk.Orientation.VERTICAL} class="wifi-list option-list">
      <With value={accessPoints}>
        {(accessPoints) => accessPoints.type === 'has-networks' ? (
          <box orientation={Gtk.Orientation.VERTICAL}>
            <For each={accessPoints.values}>
              {(ap) =>
                <NetworkEntry
                  ap={ap}
                  activeAccessPoint={activeAccessPoint()}
                />
              }
            </For>
          </box>
        ) : (
          <box orientation={Gtk.Orientation.VERTICAL}>
            <label label="No networks" />
          </box>
        )}
      </With>
    </box>
  </box>);
};
