import { useState, useEffect, useRef } from 'react'

const data = [
  {
    id: 'fruits',
    label: 'Fruits',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
      { id: 'mango', label: 'Mango' },
    ],
  },
  {
    id: 'vegetables',
    label: 'Vegetables',
    children: [
      { id: 'carrot', label: 'Carrot' },
      { id: 'broccoli', label: 'Broccoli' },
    ],
  },
]

const NestedCheckbox = () => {
  const [checkedState, setCheckedState] = useState({})
  const selectAllRef = useRef(null)

  // Initialize state
  useEffect(() => {
    const initialState = {}
    const setAllUnchecked = nodes => {
      nodes.forEach(node => {
        initialState[node.id] = false
        if (node.children) setAllUnchecked(node.children)
      })
    }
    setAllUnchecked(data)
    setCheckedState(initialState)
  }, [])

  // Helpers
  const areAllChildrenChecked = children =>
    children.every(child =>
      child.children
        ? areAllChildrenChecked(child.children)
        : checkedState[child.id],
    )

  const areSomeChildrenChecked = children =>
    children.some(child =>
      child.children
        ? areSomeChildrenChecked(child.children)
        : checkedState[child.id],
    )

  // Handle individual checkbox
  const handleChildChange = (id, value) => {
    setCheckedState(prev => ({ ...prev, [id]: value }))
  }

  // Handle parent checkbox without mutating parameter
  const handleParentChange = (node, value) => {
    const newState = {}

    const traverse = n => {
      newState[n.id] = value
      if (n.children) n.children.forEach(traverse)
    }

    traverse(node)
    setCheckedState(prev => ({ ...prev, ...newState }))
  }

  // Handle Select All without mutating parameter
  const handleSelectAllChange = value => {
    const traverseAll = nodes =>
      nodes.reduce((acc, node) => {
        const updated = { ...acc, [node.id]: value }
        if (node.children) Object.assign(updated, traverseAll(node.children))
        return updated
      }, {})

    setCheckedState(traverseAll(data))
  }

  // Render node
  const renderNode = node => {
    const hasChildren = node.children && node.children.length > 0
    const isChecked = hasChildren
      ? areAllChildrenChecked(node.children)
      : checkedState[node.id]
    const isIndeterminate =
      hasChildren && areSomeChildrenChecked(node.children) && !isChecked

    return (
      <div key={node.id} style={{ marginLeft: '20px' }}>
        <input
          id={node.id}
          type="checkbox"
          checked={!!isChecked}
          ref={el => {
            if (el) {
              // eslint-disable-next-line no-param-reassign
              el.indeterminate = isIndeterminate
            }
          }}
          onChange={e => {
            if (hasChildren) handleParentChange(node, e.target.checked)
            else handleChildChange(node.id, e.target.checked)
          }}
        />
        <label htmlFor={node.id} style={{ marginLeft: '5px' }}>
          {node.label}
        </label>
        {hasChildren && node.children.map(renderNode)}
      </div>
    )
  }

  // Select All checkbox state
  const selectAllChecked = data.every(node => areAllChildrenChecked([node]))
  const selectAllIndeterminate =
    data.some(
      node =>
        areSomeChildrenChecked([node]) ||
        (node.children && !areAllChildrenChecked(node.children)),
    ) && !selectAllChecked

  // Set indeterminate for Select All
  useEffect(() => {
    if (selectAllRef.current) {
      // eslint-disable-next-line no-param-reassign
      selectAllRef.current.indeterminate = selectAllIndeterminate
    }
  }, [selectAllIndeterminate])

  return (
    <div>
      <div>
        <input
          id="selectAll"
          type="checkbox"
          checked={selectAllChecked}
          ref={selectAllRef}
          onChange={e => handleSelectAllChange(e.target.checked)}
        />
        <label htmlFor="selectAll" style={{ marginLeft: '5px', fontWeight: 'bold' }}>
          Select All
        </label>
      </div>
      {data.map(renderNode)}
    </div>
  )
}

export default NestedCheckbox
