import { Gtk } from 'ags/gtk4';
import Wp from 'gi://AstalWp';
import { Accessor, For, createBinding, With, createState } from 'ags';
const wp = Wp.get_default();

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

export const Audio = () => {
  const audio = createBinding(wp, 'audio');
  const selectedDevice = createBinding(wp, 'defaultSpeaker');
  const [showAllStreams, setShowAllStreams] = createState(false);

  return (
    <box class="widget audio">
      <With value={selectedDevice}>
        {(selectedDevice) => (
          <box>
            <With value={audio}>
              {(audio) => {
                const streams = createBinding(audio, 'streams');
                return (
                  <menubutton class="widget-menubutton audio">
                    <image
                      icon_name={createBinding(
                        audio.defaultSpeaker,
                        'volumeIcon',
                      )}
                    />
                    <popover hasArrow={false} class="styled-popover">
                      <box orientation={Gtk.Orientation.VERTICAL}>
                        <DeviceSelect wp={wp} />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                          <box orientation={Gtk.Orientation.HORIZONTAL} class="volume-levels">
                            <label label="Volume" />
                            <slider
                              widthRequest={260}
                              onChangeValue={({ value }) =>
                                selectedDevice.set_volume(value)
                              }
                              value={createBinding(selectedDevice, 'volume')}
                            />
                            <button
                              onClicked={() => {
                                setShowAllStreams((value) => !value);
                              }}
                            >
                              <image iconName="arrow-down-symbolic" />
                            </button>
                          </box>
                          <box>
                            <revealer
                              transitionType={
                                Gtk.RevealerTransitionType.SLIDE_DOWN
                              }
                              revealChild={showAllStreams}
                            >
                              <box
                                orientation={Gtk.Orientation.VERTICAL}
                                halign={Gtk.Align.START}
                              >
                                <label
                                  label="Streams"
                                  halign={Gtk.Align.START}
                                />
                                <box orientation={Gtk.Orientation.VERTICAL}>
                                  <For each={streams}>
                                    {(stream) => (
                                      <box>
                                        <image iconName={stream.icon} />
                                        <slider
                                          widthRequest={260}
                                          onChangeValue={({ value }) =>
                                            stream.set_volume(value)
                                          }
                                          value={createBinding(
                                            stream,
                                            'volume',
                                          )}
                                        />
                                      </box>
                                    )}
                                  </For>
                                </box>
                              </box>
                            </revealer>
                          </box>
                        </box>
                      </box>
                    </popover>
                  </menubutton>
                );
              }}
            </With>
          </box>
        )
        }
      </With >
    </box >
  );
};

const DeviceSelect = ({ wp }: { wp: Wp.Wp }) => {
  const devices = createBinding(wp, 'devices');

  const handleDeviceChange = (device: Wp.Device) => {
    wp.set(device);
  };

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="audio-device-select">
      <label label="Device" />
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        revealChild={true}
        onNotifyChildRevealed={() => print('animation finished')}
      >
        <With value={devices}>
          {(devices) => (
            <Gtk.DropDown
              onNotifySelectedItem={({ selected }) => {
                console.log(selected);
              }}
              selected={1}
              $constructor={() =>
                Gtk.DropDown.new_from_strings(
                  devices
                    .filter((device) =>
                      device.deviceType === Wp.DeviceType.AUDIO_DEVICE,
                    )
                    .map((device) => device.description),
                )
              }
            />
          )}
        </With>
      </revealer>
    </box>
  );
};
