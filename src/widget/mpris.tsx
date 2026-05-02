import { createBinding, createState, createComputed } from 'ags';
import AstalMpris from 'gi://AstalMpris';
import AstalApps from 'gi://AstalApps';
import { With, For, Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';
import Pango from 'gi://Pango?version=1.0';

export const Mpris = () => {
  const mpris = AstalMpris.get_default();
  const apps = new AstalApps.Apps();
  const players = createBinding(mpris, 'players');

  const [lol, setLol] = createState<Gtk.Stack | undefined>(undefined);
  return (
    <menubutton class="widget mpris widget-menubutton" widthRequest={0}>
      <box class="mpris-icons">
        <With value={players}>
          {(players) => {
            return players.length > 0 ? (
              <button>
                <image iconName="mynaui-play-symbolic" />
              </button>
            ) : null;
          }}
        </With>
      </box>
      <popover>
        <box spacing={4} orientation={Gtk.Orientation.HORIZONTAL}>
          <For each={players}>
            {(player) => (
              <box
                class="mpris-player"
                spacing={4}
                widthRequest={200}
                overflow={Gtk.Overflow.HIDDEN}
                orientation={Gtk.Orientation.VERTICAL}
                halign={Gtk.Align.CENTER}
              >
                <box
                  overflow={Gtk.Overflow.HIDDEN}
                  halign={Gtk.Align.CENTER}
                  class="cover-art-container"
                >
                  <image
                    pixelSize={128}
                    file={createBinding(player, 'coverArt')}
                  />
                </box>
                <box
                  valign={Gtk.Align.CENTER}
                  orientation={Gtk.Orientation.VERTICAL}
                  overflow={Gtk.Overflow.HIDDEN}
                >
                  <Gtk.Inscription
                    xalign={0.5}
                    wrapMode={Pango.WrapMode.WORD}
                    textOverflow={Gtk.InscriptionOverflow.ELLIPSIZE_END}
                    text={createBinding(player, 'title')}
                    tooltipText={createBinding(player, 'title')}
                  />
                  <Gtk.Inscription
                    xalign={0.5}
                    wrapMode={Pango.WrapMode.WORD}
                    textOverflow={Gtk.InscriptionOverflow.ELLIPSIZE_END}
                    text={createBinding(player, 'artist')}
                    tooltipText={createBinding(player, 'artist')}
                  />
                </box>
                <box hexpand halign={Gtk.Align.CENTER}>
                  <button
                    onClicked={() => player.previous()}
                    visible={createBinding(player, 'canGoPrevious')}
                  >
                    <image iconName="media-seek-backward-symbolic" />
                  </button>
                  <button
                    onClicked={() => player.play_pause()}
                    visible={createBinding(player, 'canControl')}
                  >
                    <box>
                      <image
                        iconName="media-playback-start-symbolic"
                        visible={createBinding(
                          player,
                          'playbackStatus',
                        )((s) => s === AstalMpris.PlaybackStatus.PLAYING)}
                      />
                      <image
                        iconName="media-playback-pause-symbolic"
                        visible={createBinding(
                          player,
                          'playbackStatus',
                        )((s) => s !== AstalMpris.PlaybackStatus.PLAYING)}
                      />
                    </box>
                  </button>
                  <button
                    onClicked={() => player.next()}
                    visible={createBinding(player, 'canGoNext')}
                  >
                    <image iconName="media-seek-forward-symbolic" />
                  </button>
                </box>
              </box>
            )}
          </For>
        </box>
      </popover>
    </menubutton>
  );
};
