import { Gtk } from 'ags/gtk4';
import Wp from 'gi://AstalWp';
import { Accessor, For, createBinding, With } from 'ags';
import { DeviceSelect } from './device-select';
import { Streams } from './streams';
const wp = Wp.get_default();

export const Audio = () => {
  const audio = createBinding(wp, 'audio');
  const selectedDevice = createBinding(wp, 'defaultSpeaker');

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
                        <DeviceSelect wp={wp} defaultSpeaker={selectedDevice} />
                        <Gtk.Separator />
                        <box orientation={Gtk.Orientation.VERTICAL} class="volume-container">
                          <label label="Volume" halign={Gtk.Align.START} />
                          <box orientation={Gtk.Orientation.HORIZONTAL} class="volume-levels">
                            <slider
                              widthRequest={260}
                              onChangeValue={({ value }) =>
                                selectedDevice.set_volume(value)
                              }
                              value={createBinding(selectedDevice, 'volume')}
                            />
                          </box>
                        </box>
                        <With value={streams}>
                          {(streams) => streams.length > 0 ? (
                            <Streams streams={streams} />
                          ) : null}
                        </With>
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
