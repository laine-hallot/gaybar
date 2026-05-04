import { Gtk } from 'ags/gtk4';
import {
  With,
  Accessor,
  createConnection,
  createComputed,
  createBinding,
  For,
  createState,
} from 'ags';
import Battery from 'gi://AstalBattery';
import Gio from 'gi://Gio';
import AstalPowerProfiles from 'gi://AstalPowerProfiles?version=0.1';

type IconName<T extends string> = `${T}-symbolic`;

const battery = Battery.get_default();
const batteryIcon = (info: PowerInfo): IconName<string> => {
  const statusType = (() => {
    if (!info.isPresent) {
      return 'x';
    }
    if (info.charging) {
      return 'charging';
    } else {
      if (info.percentage >= 0.99) return 'full';
      // even though the battery is not charging the icon names still start with "battery-charging"
      if (info.percentage >= 0.9) return 'charging-four';
      if (info.percentage >= 0.7) return 'charging-three';
      if (info.percentage >= 0.5) return 'charging-two';
      if (info.percentage >= 0.05) return 'charging-one';
      return 'empty';
    }
  })();
  // ex. mynaui-battery-charging-four-symbolic.svg
  return `mynaui-battery-${statusType}-symbolic`;
};

const powerProfiles = AstalPowerProfiles.get_default();

type PowerInfo = { percentage: number; charging: boolean; isPresent: boolean };
export const BatteryWidget = () => {
  const percentage = createBinding(battery, 'percentage');
  const charging = createBinding(battery, 'charging');
  const isPresent = createBinding(battery, 'isPresent');

  const info = createComputed<PowerInfo>(() => ({
    percentage: percentage(),
    charging: charging(),
    isPresent: isPresent(),
  }));

  const activeProfile = createConnection(powerProfiles.activeProfile, [
    powerProfiles,
    'notify::active-profile',
    () => powerProfiles.get_active_profile(),
  ]);

  const profiles = powerProfiles.get_profiles();
  return (
    <box hexpand halign={Gtk.Align.CENTER} class="widget battery">
      <menubutton
        $type="center"
        hexpand
        halign={Gtk.Align.CENTER}
        class="widget-menubutton"
      >
        <With value={info}>
          {(info) => (
            <Gtk.Picture
              $type="svg"
              //iconName={batteryIcon(info)}
              // force icon for for debugging
              class="battery-icon"
              file={Gio.File.new_for_path(
                `/home/laineh/Projects/astal-bar/icons/hicolor/scalable/actions/${batteryIcon(info)}.svg`,
              )}
            />
          )}
        </With>
        <popover class="battery-popover styled-popover" hasArrow={false}>
          <box orientation={Gtk.Orientation.VERTICAL} class="battery-popover-content" widthRequest={230}>
            <box>
              <With value={info}>
                {(info) => (
                  <centerbox
                    class="battery-state"
                    orientation={Gtk.Orientation.HORIZONTAL}
                    halign={Gtk.Align.FILL}
                  >
                    <label
                      $type="start"
                      class="battery-state-label"
                      label={info.charging ? 'Charging' : 'Discharging'}
                    />
                    <label
                      $type="end"
                      class="value"
                      label={`${(info.percentage * 100).toFixed(0)}%`}
                    />
                  </centerbox>
                )}
              </With>
            </box>
            <Gtk.Separator />
            <box class="power-profile-container option-list" orientation={Gtk.Orientation.VERTICAL}>
              <label class="power-profile-label" label="Profile" halign={Gtk.Align.START} />
              <With value={activeProfile}>
                {(activeProfile) => (
                  <box orientation={Gtk.Orientation.VERTICAL}>
                    {profiles.map((profile, index) =>
                      <button
                        class={`option-list-item ${profile.profile === activeProfile ? 'active' : ''}`}
                        onClicked={() => {
                          powerProfiles.set_active_profile(
                            profiles[index]!.profile,
                          );
                        }}
                      >
                        <box spacing={8} class="list-option-content">
                          <box widthRequest={16}>
                            <image
                              iconName="object-select-symbolic"
                              visible={profile.profile === activeProfile}
                            />
                          </box>
                          <label label={profile.profile} class="option-label" />
                        </box>
                      </button>
                    )}
                  </box>
                )}
              </With>
            </box>
          </box>
        </popover>
      </menubutton>
    </box>
  );
};
