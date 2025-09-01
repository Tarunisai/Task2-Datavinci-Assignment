import { useState, useEffect } from "react";

const data = [
  {
    id: "fruits",
    label: "Fruits",
    children: [
      { id: "apple", label: "Apple" },
      { id: "banana", label: "Banana" },
      { id: "mango", label: "Mango" },
    ],
  },
  {
    id: "vegetables",
    label: "Vegetables",
    children: [
      { id: "carrot", label: "Carrot" },
      { id: "broccoli", label: "Broccoli" },
    ],
  },
];

const NestedCheckbox = () => {
  const [checkedState, setCheckedState] = useState({});

  useEffect(() => {
    const initialState = {};
    const setAllUnchecked = (nodes) => {
      nodes.forEach((node) => {
        initialState[node.id] = false;
        if (node.children) setAllUnchecked(node.children);
      });
    };
    setAllUnchecked(data);
    setCheckedState(initialState);
  }, []);

  const areAllChildrenChecked = (children) =>
    children.every((child) =>
      child.children ? areAllChildrenChecked(child.children) : checkedState[child.id]
    );

  const areSomeChildrenChecked = (children) =>
    children.some((child) =>
      child.children ? areSomeChildrenChecked(child.children) : checkedState[child.id]
    );

  const handleChildChange = (id, value) => {
    const newState = { ...checkedState, [id]: value };
    setCheckedState(newState);
  };

  const handleParentChange = (node, value) => {
    const newState = { ...checkedState };
    const traverse = (n) => {
      newState[n.id] = value;
      if (n.children) n.children.forEach(traverse);
    };
    traverse(node);
    setCheckedState(newState);
  };

  const handleSelectAllChange = (value) => {
    const newState = {};
    const traverseAll = (nodes) => {
      nodes.forEach((node) => {
        newState[node.id] = value;
        if (node.children) traverseAll(node.children);
      });
    };
    traverseAll(data);
    setCheckedState(newState);
  };

  const renderNode = (node) => {
    const hasChildren = node.children && node.children.length > 0;
    const isChecked = hasChildren ? areAllChildrenChecked(node.children) : checkedState[node.id];
    const isIndeterminate = hasChildren && areSomeChildrenChecked(node.children) && !isChecked;

    return (
      <div key={node.id} style={{ marginLeft: "20px" }}>
        <input
          type="checkbox"
          checked={isChecked}
          ref={(el) => el && (el.indeterminate = isIndeterminate)}
          onChange={(e) => {
            if (hasChildren) handleParentChange(node, e.target.checked);
            else handleChildChange(node.id, e.target.checked);
          }}
        />
        <label style={{ marginLeft: "5px" }}>{node.label}</label>
        {hasChildren && node.children.map(renderNode)}
      </div>
    );
  };

  const selectAllChecked = data.every((node) => areAllChildrenChecked([node]));
  const selectAllIndeterminate =
    data.some((node) => areSomeChildrenChecked([node]) || (node.children && !areAllChildrenChecked(node.children))) &&
    !selectAllChecked;

  return (
    <div>
      <div>
        <input
          type="checkbox"
          checked={selectAllChecked}
          ref={(el) => el && (el.indeterminate = selectAllIndeterminate)}
          onChange={(e) => handleSelectAllChange(e.target.checked)}
        />
        <label style={{ marginLeft: "5px", fontWeight: "bold" }}>Select All</label>
      </div>
      {data.map(renderNode)}
    </div>
  );
};

export default NestedCheckbox;
