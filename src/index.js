import React from 'react';
import ReactDOM from 'react-dom';
import Plants from './data/plants.json';
import './index.css';

const STARTING_TABLE_TAG = '00100'; /* Fruit table tag */
const MappleToolTip = require('reactjs-mappletooltip').default;


class NestedTables extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      step: -1, /* Start at -1 so first new step will be 0 */
      history: {},
      tags: Plants.tags,
    };

    this.addTable = this.addTable.bind(this);
    this.handleClick = this.handleClick.bind(this);
  };

  componentDidMount() {
    document.title = "Nested Tables"
    this.addTable(STARTING_TABLE_TAG, 0);
  };

  
  handleClick(evt, tag, clickedTableIndex) {
    if (!(tag in Plants)) {
      alert(`${Plants.tags[tag]} (#${tag}) doesn't have a table available.`);
      return;
    }

    this.addTable(tag, clickedTableIndex);
  };


  /**
   * Adds a new table and updates the history with this new event. The new set of tables will be everything
   * from the first table up to the table clicked, followed by the new table.
   * 
   * @param {*} titleTag 
   * @param {*} clickedTableIndex 
   */
  addTable(titleTag, clickedTableIndex) {
    const stepNumber = this.state.step + 1;
    const history = JSON.parse(JSON.stringify(this.state.history));
    const json = Plants[titleTag];
    console.log(`step ${this.state.step}`)
    let newHistory = {};
    if (this.state.step === -1) {
      newHistory['step0'] = [{[titleTag]: json}];
      console.log(`started with ${JSON.stringify(newHistory)}`);
    } else {
      const newStep = history['step'+this.state.step].slice(0, clickedTableIndex + 1);
      newStep.push({[titleTag]: json})
      console.log(`added ${newStep}`)
      newHistory['step'+stepNumber] = newStep;
    }

    console.log(`newHistory is ${JSON.stringify(newHistory)}`);

    this.setState({
      history: newHistory,
      step: stepNumber,
    });
  };

  render() {
    if (this.state.step === -1) {
      return null;
    }

    const history = JSON.parse(JSON.stringify(this.state.history));
    const step = this.state.step;
    const currentTables = history['step'+step];
    console.log(history);
    console.log(`step ${step}`);
    console.log(`current: ${JSON.stringify(currentTables)}`);

    const tableTagsList = currentTables.map((table) => Object.keys(table));
    console.log(`tableTags: ${JSON.stringify(tableTagsList)}`);
    const tableComponents = [];
    for (let t = 0; t < currentTables.length; t++) {
      const tag = tableTagsList[t];
      const table = currentTables[t];
      console.log(tag);
      const data = table[tag];
      console.log(currentTables);
      console.log(data);

      const heads = Object.keys(data[0]);
      const rows = [];
      for (let r = 0; r < data.length; r++) {
        const row = heads.map(key => data[r][key]);
        rows.push(row);
      }

      tableComponents.push(<Table key={tag} tag={tag} index={t} heads={heads} rows={rows}
                            tags={this.state.tags} handleClick={this.handleClick} />
      );
    }
    console.log(tableComponents);


    return (
      <div key="tables">
        { tableComponents }
      </div>
    );
  };
}


function Table(props) {
  const rows = props.rows.slice();
  for (let r = 0; r < rows.length; r++) {
    rows[r] = <TableRow key={`${props.tag}r${r}`} index={props.index} row={r} data={rows[r]} tags={props.tags} handleClick={props.handleClick} />
  };

  return (
    <div>
      <table key={`table${props.tag}`} className='result'>
        <TableHead key={`${props.tag}THD`} tag={props.tag} heads={props.heads} tags={props.tags} />
        <tbody key={`${props.tag}TB`}>{rows}</tbody>
      </table>
    </div>
  );
}

function TableHead(props) {
  const title = props.tags[props.tag] ? props.tags[props.tag] : props.tag;
  const width = props.heads.length;

  const titleRow = (
    <tr key={`${props.tag}trt`}>
      <th colSpan={width} className='table-title'>{`${title} (#${props.tag})`}</th>
    </tr>
  );

  const heads = [];
  for (let h = 0; h < props.heads.length; h++) {
    heads.push(<th key={`${props.tag}trh${h}`}>{props.heads[h]}</th>);
  }

  const headerRow = (
    <tr key={`${props.tag}trh`}>
      {heads}
    </tr>
  );

  return (
    <thead key={`${props.tag}thd`}>
      {titleRow}
      {headerRow}
    </thead>
  );
}

function TableRow(props) {
  const cells = [];
  for (let c = 0; c < props.data.length; c++) {
    const cData = props.data[c];
    const cKey = `${props.tag}r${props.row}c${c}`;
    if (props.tags[cData]) {
      cells.push(<ClickableCell key={cKey} index={props.index} ckey={cKey} data={cData} tags={props.tags} handleClick={props.handleClick} />)
    } else {
      cells.push(<td key={cKey}>{cData}</td>)
    }
  }

  return (
    <tr>{cells}</tr>
  );
}

function ClickableCell(props) {
  const tag = props.data;
  const cData = props.tags[tag];
  return (
    <td
      key={`${props.ckey}c`}
      onClick={(e) => props.handleClick(e, tag, props.index)}
      className={(tag in Plants) ? 'clickable' : 'broken-link'}
    >
      <div>
        <MappleToolTip mappleType='info' direction='right'>
          <div>{cData}</div>
          <div>{`Tag: ${props.data}`}</div>
        </MappleToolTip>
      </div>
    </td>
  );
}



// ====================================================

ReactDOM.render(
  <NestedTables />,
  document.getElementById('root')
);
