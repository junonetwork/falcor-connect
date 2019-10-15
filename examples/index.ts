import { createElement as el } from 'react'
import { render } from 'react-dom'
import { Route, BrowserRouter, Link } from 'react-router-dom'
import { TodoList } from './hoc'
import { Widget } from './hook'
import { CachedWidget } from './hook-cached'

render((
  el(BrowserRouter, {},
    el('h1', null, el(Link, { to: '/' }, 'Falcor Connect')),
    el(Route, { exact: true, path: '/' },
      el('nav', null,
        el('ul', null,
          el('li', null, el(Link, { to: '/with-falcor' }, 'withFalcor HOC')),
          el('li', null, el(Link, { to: '/use-stream' }, 'useStream Hook')),
          el('li', null, el(Link, { to: '/use-stream-cached' }, 'useStream Hook with caching'))))),
    el(Route, { path: '/with-falcor', component: TodoList }),
    el(Route, { path: '/use-stream', component: Widget }),
    el(Route, { path: '/use-stream-cached', component: CachedWidget }))
), document.getElementById('app'))
