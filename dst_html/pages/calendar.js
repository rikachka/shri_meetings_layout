import Ractive from 'ractive';
var template = require('./calendar.haml');

import ComponentHeader from '../components/header.js';
import ComponentTimetable from '../components/timetable.js';
import ComponentMeeting from '../components/meeting.js';

const Main = new Ractive({
    el: 'root',
    template: template.template,
    css: template.css,
    components: {
        ComponentHeader: ComponentHeader,
        ComponentTimetable: ComponentTimetable,
        ComponentMeeting: ComponentMeeting   
    },
    data: {
        page: 'meeting',
    }
});

export default Main;
