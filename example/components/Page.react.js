import cx from 'classnames';
import PropTypes from 'prop-types';
import React, {Children} from 'react';
import {Col, Jumbotron, NavItem, Row} from 'react-bootstrap';

import Container from './Container';
import PageFooter from './PageFooter';
import PageHeader from './PageHeader';
import PageMenu from './PageMenu';

import getIdFromTitle from '../util/getIdFromTitle';
import {BS3, BS4, HASHES} from '../util/bsVersions';

class Page extends React.Component {
  state = {
    activeHref: window.location.hash,
    bsVersion: BS3,
  };

  getChildContext() {
    return {
      isBS3: this.state.bsVersion === BS3,
      onAfter: this._onAfter,
      onBefore: this._onBefore,
    };
  }

  componentWillMount() {
    this._hrefs = [];
    this._sections = [];

    Children.forEach(this.props.children, ({props}) => {
      this._hrefs.push(`#${getIdFromTitle(props.title)}`);
      this._sections.push(props.title);
    });
  }

  render() {
    const {children, title} = this.props;
    const {bsVersion} = this.state;

    return (
      <div
        className={cx('bs-docs-page', {
          'bs4': bsVersion === BS4,
        })}>
        <PageHeader
          onVersionChange={this._handleVersionChange}
          selectedVersion={bsVersion}
        />
        <Jumbotron>
          <Container>
            <h1>{title}</h1>
          </Container>
        </Jumbotron>
        <Container>
          <Row>
            <Col md={9}>
              {children}
            </Col>
            <Col className="bs-docs-sidebar-holder" md={3}>
              <PageMenu>
                {this._sections.map(this._renderMenuItem)}
              </PageMenu>
            </Col>
          </Row>
        </Container>
        <PageFooter />
      </div>
    );
  }

  _renderMenuItem = (title, idx) => {
    const href = `#${getIdFromTitle(title)}`;
    return (
      <NavItem
        active={href === this.state.activeHref}
        key={idx}
        onClick={() => this._handleMenuItemClick(href)}>
        {title}
      </NavItem>
    );
  }

  _handleVersionChange = (bsVersion) => {
    if (bsVersion === this.state.bsVersion) {
      return;
    }

    const items = document.head.children;

    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii];
      if (item.href && item.href.indexOf('bootstrap.min.css') !== -1) {
        // `integrity` must be set before `href`.
        item.setAttribute('integrity', `sha384-${HASHES[bsVersion]}`);
        item.setAttribute(
          'href',
          `https://maxcdn.bootstrapcdn.com/bootstrap/${bsVersion}/css/bootstrap.min.css`
        );
        break;
      }
    }

    this.setState({bsVersion});
  }

  _handleMenuItemClick = (activeHref) => {
    window.location.hash = activeHref;
    this._updateActiveHref(activeHref);
  }

  _onAfter = (href) => {
    this._updateActiveHref(href);
  }

  _onBefore = (href) => {
    const index = this._hrefs.indexOf(href) - 1;
    this._updateActiveHref(this._hrefs[index]);
  }

  _updateActiveHref = (activeHref, callback) => {
    if (this._updateActiveHrefHandle != null) {
      return;
    }

    this._updateActiveHrefHandle = setTimeout(() => {
      this._updateActiveHrefHandle = null;
      this.setState({activeHref});
    });
  }
}

Page.childContextTypes = {
  isBS3: PropTypes.bool.isRequired,
  onAfter: PropTypes.func.isRequired,
  onBefore: PropTypes.func.isRequired,
};

Page.propTypes = {
  title: PropTypes.node.isRequired,
};

export default Page;
