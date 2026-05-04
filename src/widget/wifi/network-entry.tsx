import { Gtk } from 'ags/gtk4';
import AstalNetwork from 'gi://AstalNetwork';

import { Accessor, For, createConnection, createBinding, With } from 'ags';
import { execAsync, createSubprocess, exec } from 'ags/process';

const astalNetwork = AstalNetwork.get_default();

export const NetworkEntry = ({
  ap,
  activeAccessPoint,
}: {
  ap: AstalNetwork.AccessPoint;
  activeAccessPoint: AstalNetwork.AccessPoint | undefined;
}) => {
  async function connect(ap: AstalNetwork.AccessPoint) {
    // connecting to ap is not yet supported
    // https://github.com/Aylur/astal/pull/13
    try {
      await execAsync(`nmcli d wifi connect ${ap.bssid}`);
    } catch (error) {
      // you can implement a popup asking for password here
      console.error(error);
    }
  }

  const disconnect = async () => {
    try {
      await execAsync(`nmcli d wifi disconnect ${ap.bssid}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      class={`network-entry option-list-item ${activeAccessPoint === ap ? 'active' : ''}`}
      onClicked={() => {
        if (activeAccessPoint === ap) {
          disconnect();
        } else {
          connect(ap);
        }
      }}
    >
      <box spacing={4}>
        <box widthRequest={16}>
          <image
            iconName="object-select-symbolic"
            visible={activeAccessPoint === ap}
          />
        </box>
        <box widthRequest={200}>
          <label label={createBinding(ap, 'ssid')} class="network-ssid option-label" $type="start" />
          <image iconName={createBinding(ap, 'iconName')} $type="end" />
        </box>
      </box>
    </button>
  );
};
