import { Gtk } from 'ags/gtk4';
import AstalNetwork from 'gi://AstalNetwork';

import { Accessor, For, createConnection, createBinding, With } from 'ags';
import { execAsync, createSubprocess, exec } from 'ags/process';

const astalNetwork = AstalNetwork.get_default();

export const WifiToggle = () => {
  const wifi = createBinding(astalNetwork, 'wifi');
  const wired = createBinding(astalNetwork, 'get_wired');

  return (
    <box>
      <box orientation={Gtk.Orientation.VERTICAL}>
        <togglebutton actionName={'wifi-toggle'} label="Turn Wifi Off" />
        <togglebutton
          label="Turn Wifi On"
          onToggled={({ active }) => print(active)}
          actionName={'wifi-toggle'}
        />
      </box>
    </box>
  );
};
