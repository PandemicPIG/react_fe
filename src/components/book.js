import React from 'react'

function Book(props) {
  if (props.item === "header") {
    return (
      <tr>
        <th>#</th>
        <th>Title</th>
        <th>Author</th>
        <th>Publication year</th>
        <th>Publication country</th>
        <th>Publication city</th>
        <th>Nr. of pages</th>
      </tr>
    )
  } else if (props.item) {
    return (
      <tr className="Book">
        <td>{props.item.id}</td>
        <td>{props.item.book_title}</td>
        <td>{props.item.book_author}</td>
        <td>{props.item.book_publication_year}</td>
        <td>{props.item.book_publication_country}</td>
        <td>{props.item.book_publication_city}</td>
        <td>{props.item.book_pages}</td>
      </tr>
    )
  } else return null
}

export default Book
