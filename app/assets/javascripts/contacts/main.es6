import Contacts         from './index/contacts.es6'
import Contact          from './show/contact.es6'
import NewContact       from './shared/new_contact.es6'
import QuickSearch      from '../shared/quick_search.es6'
import AdvancedSearch   from './shared/advanced_search.es6'
import ParamsService    from '../shared/params_service.es6'
import PermissionDenied from '../shared/permission_denied.es6'

class Main extends React.Component {
  constructor(props) {
    super(props);

    if(this.props.location.query.active == 'true') {
      var activeFilter = true;
    }
    else if(this.props.location.query.active == 'false') {
      var activeFilter = false;
    }

    this.state = {
      contacts: [],
      loaded:   false,

      filters: {
        quickSearch:     this.props.location.query.quickSearch || '',
        name:            this.props.location.query.name        || '',
        email:           this.props.location.query.email       || '',
        address:         this.props.location.query.address     || '',
        phone:           this.props.location.query.phone       || '',
        active:          activeFilter,
        organizationIds: this.props.location.organizationIds,
        fieldIds:        this.props.location.fieldIds,
        eventIds:        this.props.location.eventIds,
        projectIds:      this.props.location.projectIds,
        notes:           this.props.location.query.notes       || '',
      }
    };
  }

  componentWillMount() {
    this.dReloadFromBackend = _.debounce(this.reloadFromBackend, 300);
    this.dUpdateUrl         = _.debounce(this.updateUrl, 300);
  }

  componentDidMount() {
    this.reloadFromBackend()
    this.selectHeaderMenu()
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.filtersHaveChanged(prevProps)) {
      this.reloadFromBackend();
    }
  }

  selectHeaderMenu() {
    $('.nav.sections li').removeClass('selected')
    $('.nav.sections li.contacts').addClass('selected')
  }

  filtersHaveChanged(prevProps) {
    return _.some(this.filterNames, (filterName) => {
      return prevProps.location.query[filterName] != this.props.location.query[filterName];
    });
  }

  buildFilterParams() {
    return _.zipObject(this.filterNames, _.map(this.filterNames, (filterName) => {
      return this.props.location.query[filterName];
    }));
  }

  reloadFromBackend(offset = 0) {
    var params = _.assign({}, this.buildFilterParams(), {
      offset: offset
    });

    http.get(this.props.contactsPath, params, (data) => {
      this.setState({
        contacts: offset == 0 ? data.contacts : this.state.contacts.concat(data.contacts),
        loaded:   true,
      });
    });
  }

  updateUrl(newValues) {
    var query        = _.assign({}, this.props.location.query, newValues);
    var paramsString = ParamsService.rejectEmptyParams($.param(query))
    this.props.router.push('contacts?' + paramsString);
  }

  updateQuickSearch(newQuickSearch) {
    this.setState({ loaded: false })

    this.dUpdateUrl({
      quickSearch: newQuickSearch
    });
  }

  updateAdvancedSearchFilters(newFilters) {
    this.setState({ loaded: false })

    this.dUpdateUrl(newFilters);
  }

  openNewContactModal() {
    $('.new-contact-modal').modal('show');
  }

  render() {
    if(this.props.permissions.canReadContacts) {
      // var advancedSearchFilters = _.zipObject(this.filterNames, _.map(this.filterNames, (filterName) => {
      //   return this.props.location.query[filterName];
      // }));

      return (
        <div className="container-fluid container-contact">
          <div className="row">
            <div className="col-md-4 pull-right complete-search">
              <AdvancedSearch filters={this.state.filters}
                              updateAdvancedSearchFilters={this.updateAdvancedSearchFilters.bind(this)}
                              organizationOptionsPath={this.props.organizationOptionsPath}
                              fieldOptionsPath={this.props.fieldOptionsPath}
                              eventOptionsPath={this.props.eventOptionsPath}
                              projectOptionsPath={this.props.projectOptionsPath} />
            </div>

            <div className="col-md-8 col-contacts">
              <QuickSearch title="Contacts"
                           loaded={this.state.loaded}
                           results={this.state.contacts.length}
                           quickSearch={this.state.filters.quickSearch}
                           updateQuickSearch={this.updateQuickSearch.bind(this)}
                           filterParams={this.buildFilterParams()}
                           exportUrl={this.props.contactsPath + '/export'} />

              { this.renderNewContactLink() }

              { this.renderContact()  }
              { this.renderContacts() }
            </div>
          </div>

          { this.renderNewContactModal() }
        </div>
      );
    }
    else {
      return (
        <PermissionDenied />
      )
    }
  }

  renderNewContactLink() {
    if(this.props.permissions.canWriteContacts) {
      return (
        <button className="btn btn-primary new"
                onClick={this.openNewContactModal.bind(this)}>
          Nouveau contact
        </button>
      )
    }
  }

  renderContacts() {
    if(!this.props.params.id) {
      return (
        <Contacts permissions={this.props.permissions}
                  contacts={this.state.contacts}
                  loaded={this.state.loaded}
                  search={this.props.location.search}
                  loadingImagePath={this.props.loadingImagePath} />
      )
    }
  }

  renderContact() {
    if(this.props.params.id) {
      return (
        <Contact id={this.props.params.id}
                 permissions={this.props.permissions}
                 loaded={this.state.loaded}
                 contactsPath={this.props.contactsPath}
                 search={this.props.location.search}
                 loadingImagePath={this.props.loadingImagePath}
                 organizationOptionsPath={this.props.organizationOptionsPath}
                 fieldOptionsPath={this.props.fieldOptionsPath}
                 eventOptionsPath={this.props.eventOptionsPath}
                 projectOptionsPath={this.props.projectOptionsPath}
                 contacts={this.state.contacts}
                 router={this.props.router}
                 reloadIndexFromBackend={this.reloadFromBackend.bind(this)} />
      )
    }
  }

  renderNewContactModal() {
    return (
      <NewContact reloadFromBackend={this.reloadFromBackend.bind(this)}
                  contactsPath={this.props.contactsPath}
                  router={this.props.router} />
    )
  }
}

module.exports = Main
