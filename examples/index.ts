import { createElement as el } from 'react'
import { render } from 'react-dom'
import { Route, BrowserRouter, Link } from 'react-router-dom'
// import { TodoList } from './falcor-hoc'
// import { TodoList as TodoListHook } from './falcor-hook'
// import { Widget } from './hook'
// import { CachedWidget } from './hook-cached'
import { Debug } from './debug'

render((
  el(BrowserRouter, {},
    el('h1', null, el(Link, { to: '/' }, 'Falcor Connect')),
    el(Route, { exact: true, path: '/' },
      el('nav', null,
        el('ul', null,
          el('li', null, el(Link, { to: '/use-stream' }, 'useStream Hook')),
          el('li', null, el(Link, { to: '/use-stream-cached' }, 'useStream Hook with caching')),
          el('li', null, el(Link, { to: '/with-falcor' }, 'withFalcor HOC')),
          el('li', null, el(Link, { to: '/use-falcor' }, 'useFalcor Hook')),
          el('li', null, el(Link, { to: '/debug' }, 'debug Hook'))))),
    el(Route, { path: '/debug', component: Debug }),
    // el(Route, { path: '/use-stream', component: Widget }),
    // el(Route, { path: '/use-stream-cached', component: CachedWidget }),
    // el(Route, { path: '/with-falcor', component: TodoList }),
    // el(Route, { path: '/use-falcor' },
    //   el('div', { style: { display: 'grid', gridTemplateColumns: '50% 50%' } },
    //     el(TodoListHook, { panel: 'left' }),
    //     el(TodoListHook, { panel: 'right' })))
  )
), document.getElementById('app'))
