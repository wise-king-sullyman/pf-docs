import React from 'react';
import { TextInput } from '@patternfly/react-core';

export class CSSSearch extends React.Component {
  state = { filterValue: '' };

  onFilterChange = (_change, event) => {
    const { filterValue } = this.state;
    const { getDebouncedFilteredRows } = this.props;
    this.setState(
      {
        filterValue: event.target.value
      },
      () => getDebouncedFilteredRows(filterValue)
    );
  };

  render() {
    const { filterValue } = this.state;
    return (
      <TextInput
        type="text"
        aria-label="Filter CSS Variables"
        placeholder="Filter CSS Variables"
        value={filterValue}
        onChange={this.onFilterChange}
      />
    );
  }
}
