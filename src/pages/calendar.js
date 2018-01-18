import Ractive from 'ractive';
var template = require('./calendar.haml');

import ComponentHeader from '../components/header.js';
import ComponentTimetable from '../components/timetable.js';

const Main = new Ractive({
  el: 'root',
  template: template.template,
  css: template.css,
  components: {
    ComponentHeader: ComponentHeader,
    ComponentTimetable: ComponentTimetable  
  },
  data: {
    activate: 0,
    head: [
      'Meat',
      'Fish'
    ],
  },
  oninit() {
    this.on('active', (evt, i) => {
      this.set('activate', i);
    });
  }
});

export default Main;
