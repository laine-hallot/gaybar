import { Gtk } from 'ags/gtk4';
import AstalNetwork from 'gi://AstalNetwork';

import { Accessor, createBinding } from 'ags';
import { execAsync } from 'ags/process';

export const NetworkEntry = ({
  ap,
  activeAccessPoint,
}: {
  ap: AstalNetwork.AccessPoint;
  activeAccessPoint: AstalNetwork.AccessPoint | undefined;
}) => {
  async function connect(ap: AstalNetwork.AccessPoint) {
    try {
      await execAsync(`nmcli d wifi connect ${ap.bssid}`);
    } catch (error) {
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
      <centerbox>
        <box widthRequest={16} $type="start">
          <image
            iconName="object-select-symbolic"
            visible={activeAccessPoint === ap}
          />
        </box>
        <label
          $type="center"
          label={createBinding(ap, 'ssid')}
          class="network-ssid option-label"
          halign={Gtk.Align.START}
          hexpand={true}
        />
        <image widthRequest={16} iconName={createBinding(ap, 'iconName')} $type="end" />
      </centerbox>
    </button >
  );
};
