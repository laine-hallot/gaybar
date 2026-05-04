import { Gtk } from 'ags/gtk4';
import Wp from 'gi://AstalWp';
import { Accessor, For, createBinding, With, createState, createComputed } from 'ags';
import Pango from 'gi://Pango?version=1.0';

export const DeviceSelect = ({ wp, defaultSpeaker }: { wp: Wp.Wp, defaultSpeaker: Wp.Endpoint }) => {
  const devices = createBinding(wp, 'devices');

  const handleDeviceChange = (device: Wp.Device) => {
    wp.set(device);
  };

  console.log(defaultSpeaker.device)

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="audio-device-select">
      <label label="Devices" halign={Gtk.Align.START} class="device-select-label" />
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        revealChild={true}
        onNotifyChildRevealed={() => print('animation finished')}
      >
        <With value={devices}>
          {(devices) => (
            <box orientation={Gtk.Orientation.VERTICAL} class="output-devices option-list">
              {devices
                .filter((device) =>
                  device.deviceType === Wp.DeviceType.AUDIO_DEVICE,
                )
                .map((device) =>
                  <button
                    class={`option-list-item ${device.id === defaultSpeaker.id ? 'active' : ''}`}
                    onClicked={() => {
                      handleDeviceChange(device);
                    }}
                  >
                    <box spacing={8} class="list-option-content">
                      <box widthRequest={16}>
                        <image
                          iconName="object-select-symbolic"
                          visible={device.id === defaultSpeaker.id}
                        />
                      </box>
                      <label label={device.description} class="option-label" />
                    </box>
                  </button>
                )}
            </box>
          )}
        </With>
      </revealer>
    </box>
  );
};
