import { Gtk } from 'ags/gtk4';
import AstalNetwork from 'gi://AstalNetwork';

import {
  Accessor,
  createBinding,
  createState,
  With,
} from 'ags';
import { execAsync } from 'ags/process';

export const WifiToggle = ({ wifiEnabled }: { wifiEnabled: boolean }) => {
  const [loading, setLoading] = createState(false);

  const handleWifiToggle = async (toggle: Gtk.Switch) => {
    setLoading(true);
    await execAsync(`nmcli radio wifi ${toggle.active ? 'on' : 'off'}`).catch((err) => { console.log("Error changing Wifi setting:"); console.error(err) });
    setLoading(false);
  };

  return (
    <box class="wifi-toggle">
      <box>
        <switch
          actionName={'wifi-toggle'}
          canTarget={true}
          sensitive={true}
          $constructor={(toggle) => {
            const newToggle = new Gtk.Switch({
              ...toggle,
              active: wifiEnabled,
            });
            return newToggle;
          }}
          onNotifyActive={(toggle) => {
            handleWifiToggle(toggle);
          }}
        />
        <label label="Wifi" />
        <Gtk.Spinner spinning={loading} />
      </box>
    </box>
  );
};
