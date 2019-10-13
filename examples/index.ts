import { createElement } from 'react'
import { render } from 'react-dom'
import { TodoList } from './todoList'

render((
  createElement('div', null,
    createElement('h1', null, 'Falcor Connect'),
    createElement(TodoList, null))
), document.getElementById('app'))
