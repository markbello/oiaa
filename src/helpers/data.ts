import moment from 'moment-timezone';

import { days, State } from '../helpers';
import { Meeting } from '../components';

//set time zones, apply filters, and sort meetings, runs on state change
export function filterData(
  { meetings, search, timezone }: State,
  tags: string[]
): Meeting[] {
  //get current timestamp
  const now = moment();
  //const now = moment.tz('Saturday 8:12 PM', 'dddd h:mm a', timezone);

  //loop through meetings for time operations
  meetings.map(meeting => {
    if (meeting.time) {
      //convert timezone
      meeting.time.tz(timezone);

      //make all meetings upcoming (now is used for debugging)
      let diff = meeting.time.diff(now, 'minutes');

      //meeting could be more than one week back
      if (diff < -10080) {
        meeting.time.add(1, 'week');
        diff = meeting.time.diff(now, 'minutes');
      }

      //show meetings that started up to 10 minutes ago
      if (diff < -10) {
        meeting.time.add(1, 'week');
      }

      //add day to meeting tags
      meeting.tags = meeting.tags.filter(tag => !days.includes(tag));
      meeting.tags.push(meeting.time.format('dddd'));
      meeting.tags.sort();
    }

    return meeting;
  });

  //filter meetings based on selected tags
  if (tags.length) {
    meetings = meetings.filter(meeting => {
      for (let i = 0; i < tags.length; i++) {
        if (!meeting.tags.includes(tags[i])) return false;
      }
      return true;
    });
  }

  //search?
  if (search) {
    meetings = meetings.filter(meeting => {
      return (
        search
          .map(word => {
            return meeting.search.includes(word);
          })
          .filter(e => e).length === search.length
      );
    });
  }

  //sort meetings (by time then name)
  meetings.sort((a: Meeting, b: Meeting) => {
    if (a.time && b.time && !a.time.isSame(b.time)) {
      return a.time.isAfter(b.time) ? 1 : -1;
    } else if (a.time && !b.time) {
      return -1;
    } else if (b.time && !a.time) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });

  //return
  return meetings;
}
