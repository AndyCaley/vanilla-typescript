import blessed from 'blessed';
import contrib from 'blessed-contrib';

var screen = blessed.screen();
var line = contrib.line(
    { style:
      { line: "yellow"
      , text: "green"
      , baseline: "black"}
    , xLabelPadding: 3
    , xPadding: 5
    , label: 'Title'});

var data = {
    x: ['t1', 't2', 't3', 't4'],
    y: [5, 1, 7, 5]
};

screen.append(line);
line.setData([data]);

screen.key(['escape', 'q'], (ch,key) => {
    return process.exit(0);
});

screen.render();
