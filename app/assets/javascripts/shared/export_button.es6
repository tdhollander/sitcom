import ParamsService from './params_service.es6'

class ExportButton extends React.Component {

  export() {
    var selectedIds = this.props.selectedIds ? this.props.selectedIds() : undefined

    if(selectedIds && selectedIds.length) {
      var url = `${this.props.exportUrl}?ids=${selectedIds.join(',')}`
    }
    else {
      var filters     = humps.decamelizeKeys(this.props.filters)
      var queryString = ParamsService.rejectEmptyParams($.param(filters))
      var url         = `${this.props.exportUrl}?${queryString}`
    }

    window.open(url, '_blank')
  }

  render() {
    var classes = 'fa fa-cloud-download'
    classes = this.props.exportUrl ? classes : classes + ' disabled'

    return (
      <i className={classes}
         title="Exporter la sélection"
         onClick={this.export.bind(this)}>
      </i>
    )
  }

}

module.exports = ExportButton
