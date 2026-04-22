import Tray from 'gi://AstalTray';
import { Accessor, For, createConnection, createBinding } from 'ags';
import Gtk from 'gi://Gtk';

const tray = Tray.get_default();

const items = createBinding(tray, 'items');

export const SystemTray = () => {
  const init = (btn: Gtk.MenuButton, item: Tray.TrayItem) => {
    btn.menuModel = item.menuModel;
    btn.insert_action_group('dbusmenu', item.actionGroup);
    item.connect('notify::action-group', () => {
      btn.insert_action_group('dbusmenu', item.actionGroup);
    });
  };
  return (
    <box class="widget tray">
      <For each={items}>
        {(item) => (
          <box>
            <menubutton
              $={(self) => init(self, item)}
              class="widget-menubutton"
            >
              <image gicon={createBinding(item, 'gicon')} />
            </menubutton>
          </box>
        )}
      </For>
    </box>
  );
};
