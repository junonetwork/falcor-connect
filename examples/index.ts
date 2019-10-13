import { createElement as el } from 'react'
import { render } from 'react-dom'
import { Route, BrowserRouter, Link } from 'react-router-dom'
import { TodoList } from './todoList'

render((
  el(BrowserRouter, {},
    el('h1', null, el(Link, { to: '/' }, 'Falcor Connect')),
    el(Route, { exact: true, path: '/' },
      el('nav', null,
        el('ul', null,
          el('li', null, el(Link, { to: '/hoc' }, 'withFalcor HOC')),
          el('li', null, el(Link, { to: '/abc' }, 'useFalcor Hook'))))),
    el(Route, { path: '/hoc', component: TodoList }))
), document.getElementById('app'))
