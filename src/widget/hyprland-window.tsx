import Hyprland from 'gi://AstalHyprland';
import { With, Accessor, createConnection, createBinding } from 'ags';

const hyprland = Hyprland.get_default();
export const HyprlandWindow = () => {
  const focused = createBinding(hyprland, 'focusedClient');

  return (
    <box class="hyprland-window">
      <With value={focused}>
        {(focused) =>
          focused !== undefined ? <label label={focused?.initialTitle} /> : null
        }
      </With>
    </box>
  );
};
