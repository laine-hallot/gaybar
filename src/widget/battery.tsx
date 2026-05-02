import { Gtk } from 'ags/gtk4';
import {
  With,
  Accessor,
  createConnection,
  createComputed,
  createBinding,
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
              cssName="battery-info"
              file={Gio.File.new_for_path(
                `/home/laineh/Projects/astal-bar/icons/hicolor/scalable/actions/${batteryIcon(info)}.svg`,
              )}
            />
          )}
        </With>
        <popover class="battery-popover">
          <box orientation={Gtk.Orientation.VERTICAL}>
            <label cssName="battery-info" label="Battery Info" />
            <With value={info}>
              {(info) => (
                <box
                  orientation={Gtk.Orientation.VERTICAL}
                  halign={Gtk.Align.END}
                >
                  <label
                    cssName="battery-info"
                    label={`${(info.percentage * 100).toFixed(0)}%`}
                  />
                  <label
                    cssName="battery-info"
                    label={info.charging ? 'Charging' : 'Discharging'}
                  />
                </box>
              )}
            </With>
            <box $type="end">
              <label cssName="battery-info" label="Profile" />
              <With value={activeProfile}>
                {(activeProfile) => (
                  <Gtk.DropDown
                    onNotifySelectedItem={({ selected }) => {
                      powerProfiles.set_active_profile(
                        profiles[selected]!.profile,
                      );
                    }}
                    selected={profiles.findIndex(
                      (profile) => profile.profile === activeProfile,
                    )}
                    $constructor={() =>
                      Gtk.DropDown.new_from_strings(
                        profiles.map((profile) => profile.profile),
                      )
                    }
                  />
                )}
              </With>
            </box>
          </box>
        </popover>
      </menubutton>
    </box>
  );
};
