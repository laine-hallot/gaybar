import { Gtk } from 'ags/gtk4';
import AstalNetwork from 'gi://AstalNetwork';

import {
  Accessor,
  For,
  createConnection,
  createBinding,
  With,
  createState,
} from 'ags';
import { execAsync, createSubprocess, exec } from 'ags/process';

const astalNetwork = AstalNetwork.get_default();

export const WifiToggle = () => {
  const iface = createBinding(astalNetwork.wifi.device, 'interface');

  const handleWifiToggle = async (toggle: Gtk.Switch) => {
    await execAsync(`nmcli radio ${iface} ${toggle.active ? 'on' : 'off'}`);
  };

  return (
    <box class="wifi-toggle">
      <switch
        actionName={'wifi-toggle'}
        canTarget={true}
        sensitive={true}
        $constructor={(toggle) => {
          const newToggle = new Gtk.Switch({
            ...toggle,
            active: true,
          });
          return newToggle;
        }}
        onActivate={(toggle) => {
          handleWifiToggle(toggle);
        }}
      />
      <label label="Wifi" />
    </box>
  );
};
