import React from 'react';
import ReactDOM from 'react-dom';
import Plants from './data/plants.json';
import './index.css';

const STARTING_TABLE_TAG = '00100'; /* Fruit table tag */
const MappleToolTip = require('reactjs-mappletooltip').default;


class Doc extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeStep: 0, /* Start at -1 so first new step will be 0 */
      latestStep: 0,
      history: {},
      loaded: false,
    };

    this.updateStep = this.updateStep.bind(this);
    this.addTable = this.addTable.bind(this);
    this.sliceHistory = this.sliceHistory.bind(this);
  };

  componentDidMount() {
    document.title = "Nested Tables";
    this.setState({
      loaded: true,
      history: {'step0': [{[STARTING_TABLE_TAG]: Plants[STARTING_TABLE_TAG]}]},
    });
  };

  updateStep(step) {
    console.log(`step updated to ${step}`);
    const activeStep = step;
    const latestStep = this.state.latestStep;
    this.setState({
      activeStep: activeStep,
      latestStep: (activeStep > latestStep) ? activeStep : latestStep,
    });
  };

  /**
   * Adds a new table and updates the history with this new event. The new set of tables will be everything
   * from the first table up to the table clicked, followed by the new table.
   * 
   * @param {*} titleTag 
   * @param {*} clickedTableIndex 
   */
  addTable(titleTag, clickedTableIndex) {
    if (!this.state.loaded) {
      return null;
    }

    const stepNumber = this.state.activeStep + 1;
    const json = Plants[titleTag];
    const activeStep = this.state.activeStep;
    console.log(`step ${activeStep}`)
    const history = this.sliceHistory(0, activeStep + 1); /* Delete the future history making new tables while rewound */
    
    if (activeStep < this.state.latestStep) {
      console.log('slicing history to step ' + activeStep);
    }

    console.log(JSON.stringify(history));
    const newStep = history['step'+activeStep].slice(0, clickedTableIndex + 1);
    newStep.push({[titleTag]: json});
    console.log(`added ${JSON.stringify(newStep)}`);
    history['step'+stepNumber] = newStep;

    console.log(`newHistory is ${JSON.stringify(history)}`);
    this.setState({
      history: history,
      activeStep: activeStep,
      latestStep: activeStep,
    });

    this.updateStep(stepNumber);
  };

  sliceHistory(start, end) {
    const history = this.state.history;
    start = start || 0;
    end = end || history.length-1;
    const newHistory = {};
    Object.keys(history).slice(start, end).forEach((key) => {
      newHistory[key] = history[key];
    });

    return newHistory;
  }
  

  render() {
    if (!this.state.loaded) {
      return null;
    }

    const activeStep = this.state.activeStep;
    console.log(`Doc: activeStep ${activeStep} latestStep ${this.state.latestStep}`);
    const stepTables = this.state.history['step'+activeStep];
    console.log(JSON.stringify(stepTables));
    return (
      <div>
        <StepperMenu
          key={`menu${activeStep}`}
          activeStep={activeStep}
          latestStep={this.state.latestStep}
          onUpdate={this.updateStep}
        />
        <NestedTables key={`tables${activeStep}`} tables={stepTables} addTable={this.addTable} />
      </div>
    );
  };
}


class StepperMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeStep: props.activeStep,
      latestStep: props.latestStep,
      onUpdate: props.onUpdate,
      inputVal: props.activeStep + 1,
      loaded: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
  };

  componentDidMount() {
    this.setState({loaded: true});
  }

  handleClick(evt) {
    const activeStep = this.state.activeStep;
    switch (evt.target.id) {
      case 'first':
        this.state.onUpdate(0);
        break;
      case 'prev':
          this.state.onUpdate(activeStep - 1);
        break;
      case 'next':
          this.state.onUpdate(activeStep + 1);
        break;
      case 'last':
          this.state.onUpdate(this.state.latestStep);
        break;
      default:
        break;
    }
  };

  handleInput = (evt) => {
    const target = evt.target;
    this.setState({
      inputVal: target.value,
    });
  };

  handleInputBlur = (evt) => {
    const newStep = evt.target.value - 1;
    if (newStep < 0 || newStep > this.state.latestStep) {
      this.setState({inputVal: this.state.activeStep});
    } else {
      this.state.onUpdate(newStep);
    }
  };

  handleKeyPress = (event) => {
    if(event.key === 'Enter'){
      console.log(event.key);
      this.handleInputBlur(event);
    }
  }

  render() {
    if (!this.state.loaded) {
      return null;
    }

    const activeStep = this.state.activeStep;
    const latestStep = this.state.latestStep;

    const firstStep = 0;
    const prevStep = activeStep - 1;
    const nextStep = activeStep + 1;
    const lastStep = latestStep;

    const firstMsg = `<<  Step 1`;
    const prevMsg  = `<  Step ${(prevStep < firstStep) ? firstStep + 1 : prevStep + 1}`;
    const nextMsg  = `Step ${(nextStep > latestStep) ? latestStep + 1 : nextStep + 1}  >`;
    const lastMsg  = `Step ${lastStep + 1}  >>`;

    console.log(`Stepper sees step ${activeStep}`);

    return (
      <form id='stepper-menu'>
        <button className='step-button' id='first' type='button'
          disabled={activeStep <= firstStep}
          onClick={this.handleClick}
        >
          {firstMsg}
        </button>

        <button className='step-button' id='prev' type='button'
          disabled={activeStep <= firstStep}
          onClick={this.handleClick}
        >
          {prevMsg}
        </button>

        <input className='stepInput' value={this.state.inputVal}
          onChange={(e) => this.handleInput(e)}  onBlur={(e) => this.handleInputBlur(e)}  onkeypress={(e) => this.handleKeyPress(e)}
        />

        <button className='step-button' id='next' type='button'
          disabled={activeStep >= lastStep}
          onClick={this.handleClick}
        >
          {nextMsg}
        </button>

        <button className='step-button' id='last' type='button'
          disabled={activeStep >= lastStep}
          onClick={this.handleClick}
        >
          {lastMsg}
        </button>
      </form>
    );
  };
}



class NestedTables extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tables: props.tables,
      tags: Plants.tags,
      addTable: props.addTable,
    };

    this.handleClick = this.handleClick.bind(this);
  };

  componentDidMount() {
    this.setState({loaded : true});
  };

  
  handleClick(tag, clickedTableIndex) {
    if (!(tag in Plants)) {
      alert(`${Plants.tags[tag]} (#${tag}) doesn't have a table available.`);
      return;
    }

    this.state.addTable(tag, clickedTableIndex);
  };


  render() {
    if (!this.state.loaded) {
      return null;
    }

    const tables = this.state.tables;
    console.log(tables);
    const tableTagsList = tables.map((table) => Object.keys(table));
    console.log(`tableTags: ${JSON.stringify(tableTagsList)}`);
    const tableComponents = [];
    for (let t = 0; t < tableTagsList.length; t++) {
      const tag = tableTagsList[t];
      const table = tables[t];
      console.log(tag);
      const data = table[tag];
      console.log(tables);
      console.log(data);

      const heads = Object.keys(data[0]);
      const rows = [];
      for (let r = 0; r < data.length; r++) {
        const row = heads.map(key => data[r][key]);
        rows.push(row);
      }

      tableComponents.push(
        <Table key={`${tag}t${t}`} tag={tag} index={t} heads={heads} rows={rows}
          tags={this.state.tags} handleClick={this.handleClick} />
      );
    }


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
      onClick={() => props.handleClick(tag, props.index)}
      className={(tag in Plants) ? 'clickable' : 'broken-link'}
    >
      <div>
        <MappleToolTip mappleType='info' direction='right'>
          <div>{cData}</div>
          <div>{`Tag: ${tag}`}</div>
        </MappleToolTip>
      </div>
    </td>
  );
}



// ====================================================

ReactDOM.render(
  <Doc />,
  document.getElementById('root')
);
