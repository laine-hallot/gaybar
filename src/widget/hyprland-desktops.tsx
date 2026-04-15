import Hyprland from 'gi://AstalHyprland';
import { With, Accessor, For, createConnection } from 'ags';

const hyprland = Hyprland.get_default();

export const HyprlandDesktops = () => {
  const workspaces = createConnection(
    hyprland.workspaces.sort((a, b) => Number(a.name) - Number(b.name)),
    [
      hyprland,
      'notify::workspaces',
      () => {
        return hyprland
          .get_workspaces()
          .sort((a, b) => Number(a.name) - Number(b.name));
      },
    ],
  );

  const focused = createConnection(hyprland.focusedWorkspace, [
    hyprland,
    'notify::focused-workspace',
    () => {
      return hyprland.get_focused_workspace();
    },
  ]);

  return (
    <box>
      <With value={focused}>
        {(focused) => (
          <box>
            <For each={workspaces}>
              {(item) => (
                <button
                  class={`hyprland-workspace ${item.id === focused.id ? 'active' : ''}`}
                  onClicked={() => {
                    item.focus();
                  }}
                >
                  <label label={`${item.name}`} />
                </button>
              )}
            </For>
          </box>
        )}
      </With>
    </box>
  );
};
