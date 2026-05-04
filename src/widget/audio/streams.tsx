import Gtk from "gi://Gtk?version=4.0";
import Pango from "gi://Pango?version=1.0";
import Wp from 'gi://AstalWp';
import { createBinding } from "ags";

export const Streams = ({ streams }: { streams: Wp.Stream[] }) => {
  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <Gtk.Separator />
      <box class="streams-container">
        <box
          orientation={Gtk.Orientation.VERTICAL}
          halign={Gtk.Align.START}
        >
          <label
            label="Streams"
            class="streams-label"
            halign={Gtk.Align.START}
          />
          <box orientation={Gtk.Orientation.VERTICAL} class="streams-list">
            {streams.map((stream) => (
              <box orientation={Gtk.Orientation.VERTICAL} class="audio-stream">
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
                  <image iconName={stream.icon} />
                  <Gtk.Inscription
                    xalign={0.5}
                    hexpand={true}
                    wrapMode={Pango.WrapMode.WORD}
                    textOverflow={Gtk.InscriptionOverflow.ELLIPSIZE_END}
                    text={`${stream.description}: ${stream.name}`}
                    tooltipText={`${stream.description}: ${stream.name}`}
                  />
                </box>
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
            ))}
          </box>
        </box>
      </box>
    </box>
  )
};
