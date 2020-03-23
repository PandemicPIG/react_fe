import React from 'react'
import { useParams, useLocation } from "react-router-dom"
import { Row, Col, Container, InputGroup, FormControl, Button, Table, Pagination } from 'react-bootstrap';
import Book from '../components/book'

class Page extends React.Component {
  constructor(props) {
    super(props)

    this.api = 'http://nyx.vima.ekt.gr:3000/api/books'

    this.activePage = {
      data: [],
      page: this.getPage(),
      itemsPerPage: this.getItemsPerPage(),
      filters: this.getFilters()
    }

    this.state = { isLoading: false }
  }

  componentDidMount() {
    this.getData(this.activePage)
  }

  render() {
    return (
      <div className="Page">
        <Container className="mb-3">
          <Row className="justify-content-md-center mb-2">
            <h3>List of books - page {this.activePage.page}</h3>
          </Row>
          <Row>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>Filter</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                defaultValue={this.activePage.filters}
                placeholder="title, author, etc"
                onChange={(e) => this.updateFilters(e)}
                onKeyPress={(e) => this.keyPress(e)}
              />
              <InputGroup.Append>
                <Button variant="primary" onClick={() => this.applyFilters()}>
                  Apply
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Row>
        </Container>

        {this.pagination()}

        {this.state.isLoading ? (<Container>
          <Row className="justify-content-md-center mb-5 mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </Row>
        </Container>) : this.bookList()}

        {this.pagination()}

      </div>
    )
  }

  getData() {
    if (!this.state.isLoading) {
      this.setState({ isLoading: true })

      fetch(this.api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemsPerPage: this.activePage.itemsPerPage,
          page: this.activePage.page,
          filters: this.activePage.filters ? this.formatFilters(this.activePage.filters) : []
        })
      }).then(res => {
        if (res.status !== 200) {
          res.text().then(err => {
            this.setState({ isLoading: false })
            throw new Error(err)
          })
        } else {
          res.json().then(data => {
            this.activePage.data = data.books
            this.activePage.totalItems = data.count
            this.setState({ isLoading: false })
          })
        }
      }).catch(e => {
        this.setState({ isLoading: false })
        throw e
      })
    }
  }

  bookList() {
    if (!this.activePage.data & !this.activePage.data.length) return null

    return (<Container>
      <Row className="justify-content-md-center">
        <Table striped bordered hover>
          <thead>
            <Book header="true" />
          </thead>
          <tbody>
            {this.activePage.data.map( book => (
              <Book item={book} key={book.id}/>
            ))}
          </tbody>
        </Table>
      </Row>
    </Container>)
  }

  pagination() {
    if (!this.activePage.totalItems | !this.activePage.itemsPerPage) return null

    this.activePage.totalPages = Math.ceil(this.activePage.totalItems / this.activePage.itemsPerPage)

    const paginationItems = Array(this.activePage.totalPages).fill(null).map((e, i) => (
      <Pagination.Item
        key={i+1}
        active={i+1 === this.activePage.page}
        onClick={() => this.updateLocation({page: i+1})}>
        {i+1}
      </Pagination.Item>
    ))

    let startPag, midPag, endPag

    if (this.activePage.totalPages > 9) {
      startPag = paginationItems.filter((a, i) => (i < 3))
      midPag = paginationItems[this.activePage.page - 1]
      endPag = paginationItems.filter((a, i) => (i > this.activePage.totalPages - 4))
    } else {
      startPag = paginationItems
    }

    return (<Container>
      <Row className="justify-content-md-center">
        <Pagination size="sm">
          <Pagination.First
            disabled={this.activePage.page === 1}
            onClick={() => this.updateLocation({page: 1})}/>
          <Pagination.Prev
            disabled={this.activePage.page === 1}
            onClick={() => this.updateLocation({page: this.activePage.page - 1})}/>
          {startPag}
          {midPag && midPag.key > 4 ? <Pagination.Ellipsis /> : ""}
          {midPag && midPag.key > 3 && midPag.key < this.activePage.totalPages - 2 ? midPag : ""}
          {midPag && midPag.key < this.activePage.totalPages - 3 ? <Pagination.Ellipsis /> : ""}
          {endPag}
          <Pagination.Next
            disabled={this.activePage.page === this.activePage.totalPages}
            onClick={() => this.updateLocation({page: this.activePage.page + 1})}/>
          <Pagination.Last
            disabled={this.activePage.page === this.activePage.totalPages}
            onClick={() => this.updateLocation({page: this.activePage.totalPages})}/>
        </Pagination>
      </Row>
    </Container>)
  }

  keyPress(e) {
    if(e.charCode === 13){
      this.updateLocation({page: 1, filters: e.target.value})
    }
  }

  applyFilters() {
    this.updateLocation({page: 1, filters: this.activePage.filters})
  }

  updateFilters(e) {
    this.activePage.filters = e.target.value
  }

  formatFilters(filterString) {
    return [{type: 'all', values: filterString.split(',')}]
  }

  updateLocation({page, items, filters}) {

    let targetHost = window.location.origin
    let targetPath = window.location.pathname
    let targetQuery = this.splitQueryPath(window.location.search)

    if(page) {
      targetPath = `\\${page}`
    }

    if(items) {
      targetQuery.items = items
    }

    if(filters) {
      targetQuery.filters = filters
    }

    let newPath = `${targetHost}${targetPath}${this.buildQueryPath(targetQuery)}`

    window.location.href = newPath
  }

  splitQueryPath(qStr) {
    return qStr.slice(1).split('&').reduce((acc, q) => {
      if(q) {
        let [k, v] = q.split("=")
        acc[k] = v
        return acc
      } else return acc
    }, {})
  }

  buildQueryPath(qObj) {
    return Object.keys(qObj).length ? '?' + Object.keys(qObj).map(v => `${v}=${qObj[v]}`).join('&') : ''
  }

  getPage() {
    let page = parseInt(window.location.pathname.slice(1))
    if (page < 1) return 1
    return page
  }

  getItemsPerPage() {
    return this.splitQueryPath(window.location.search).items || 20
  }

  getFilters() {
    return window.location.search ? decodeURIComponent(this.splitQueryPath(window.location.search).filters) : ''
  }
}

export default Page
