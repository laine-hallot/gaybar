import { Gtk } from 'ags/gtk4';
import { createPoll } from 'ags/time';

export const DateTime = () => {
  const time = createPoll('', 1000, "date '+%a %d %b %I:%M %p'");

  return (
    <box hexpand halign={Gtk.Align.CENTER} class="date-time">
      <label label={time} />
    </box>
  );
};
