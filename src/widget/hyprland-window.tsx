import Hyprland from 'gi://AstalHyprland';
import { With, Accessor, createConnection, createBinding } from 'ags';
import Pango from 'gi://Pango?version=1.0';

const hyprland = Hyprland.get_default();
export const HyprlandWindow = () => {
  const focused = createBinding(hyprland, 'focusedClient');

  return (
    <box class="widget hyprland-window">
      <With value={focused}>
        {(focused) =>
          focused !== undefined ? (
            <label
              label={focused?.initialTitle}
              ellipsize={Pango.EllipsizeMode.END}
              maxWidthChars={80}
            />
          ) : null
        }
      </With>
    </box>
  );
};
