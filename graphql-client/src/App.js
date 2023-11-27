// src/App.js
import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GET_TODOS = gql`
  query {
    todos {
      id
      text
    }
  }
`;

const ADD_TODO = gql`
  mutation ($text: String!) {
    addTodo(text: $text) {
      id
      text
    }
  }
`;

const DELETE_TODO = gql`
  mutation ($id: String!) {
    deleteTodo(id: $id) {
      id
      text
    }
  }
`;

const UPDATE_TODO = gql`
  mutation ($id: String!, $text: String!) {
    updateTodo(id: $id, text: $text) {
      id
      text
    }
  }
`;

const TodoList = ({ handleEdit, handleDelete }) => {
  const { loading, error, data } = useQuery(GET_TODOS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul style={todoStyleUL}>
      {data.todos.map((todo) => (
        <li key={todo.id} style={todoStyle}>
          <span>{todo.text}</span>
          <div>
            <button style={editButtonStyle} onClick={() => handleEdit(todo)}>
              Edit
            </button>
            <button
              style={deleteButtonStyle}
              onClick={() => handleDelete(todo.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

const AddTodo = () => {
  let input;
  const handleAddSuccess = () => {
    toast.success("Todo added successfully!");
  };
  const handleAddError = () => {
    toast.error("Failed to add todo. Please try again.");
  };
  const [addTodo] = useMutation(ADD_TODO, {
    update(cache, { data: { addTodo } }) {
      const { todos } = cache.readQuery({ query: GET_TODOS });
      cache.writeQuery({
        query: GET_TODOS,
        data: { todos: todos.concat([addTodo]) },
      });
      handleAddSuccess();
    },
    onError: handleAddError,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if the input value is not empty before adding the todo
    if (input.value.trim() !== "") {
      addTodo({ variables: { text: input.value } });
      input.value = "";
    }
  };

  return (
    <div style={addTodoContainerStyle}>
      <form onSubmit={handleSubmit}>
        <input style={addTodoInputStyle} ref={(node) => (input = node)} />
        <button style={addTodoButtonStyle} type="submit">
          Add Todo
        </button>
      </form>
    </div>
  );
};

const EditTodo = ({ todo, onCancel, onSave }) => {
  const [editedText, setEditedText] = useState(todo.text);

  const handleSave = () => {
    onSave(todo.id, editedText);
  };

  return (
    <div style={editTodoContainerStyle}>
      <input
        style={editTodoInputStyle}
        type="text"
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
      />
      <button style={saveButtonStyle} onClick={handleSave}>
        Save
      </button>
      <button style={cancelButtonStyle} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
};

const App = () => {
  const [editingTodo, setEditingTodo] = useState(null);

  const handleDeleteSuccess = () => {
    toast.success("Todo deleted successfully!");
  };

  const handleUpdateSuccess = () => {
    toast.success("Todo updated successfully!");
  };

  const handleDeleteError = () => {
    toast.error("Failed to delete todo. Please try again.");
  };

  const handleUpdateError = () => {
    toast.error("Failed to update todo. Please try again.");
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  const [deleteTodo] = useMutation(DELETE_TODO, {
    update(cache, { data: { deleteTodo } }) {
      const { todos } = cache.readQuery({ query: GET_TODOS });
      cache.writeQuery({
        query: GET_TODOS,
        data: { todos: todos.filter((todo) => todo.id !== deleteTodo.id) },
      });
      handleDeleteSuccess();
    },
    onError: handleDeleteError,
  });

  const handleDelete = (todoId) => {
    deleteTodo({ variables: { id: todoId } });
  };

  const [updateTodo] = useMutation(UPDATE_TODO, {
    update(cache, { data: { updateTodo } }) {
      const { todos } = cache.readQuery({ query: GET_TODOS });
      cache.writeQuery({
        query: GET_TODOS,
        data: {
          todos: todos.map((todo) =>
            todo.id === updateTodo.id
              ? { ...todo, text: updateTodo.text }
              : todo
          ),
        },
      });
      handleUpdateSuccess();
    },
    onError: handleUpdateError,
  });

  const handleSaveEdit = (todoId, newText) => {
    updateTodo({ variables: { id: todoId, text: newText } });
    setEditingTodo(null);
  };

  return (
    <div style={appContainerStyle}>
      <div style={addTodoCardStyle}>
        <h2 style={appHeaderStyle}>MERN Todo App with GraphQL</h2>
        <AddTodo />
      </div>
      <TodoList handleEdit={handleEdit} handleDelete={handleDelete} />
      {editingTodo && (
        <EditTodo
          todo={editingTodo}
          onCancel={handleCancelEdit}
          onSave={handleSaveEdit}
          handleUpdateSuccess={handleUpdateSuccess}
        />
      )}
      <ToastContainer autoClose={1500} />
    </div>
  );
};

// Styles
const addTodoCardStyle = {
  width: "50vw",
  margin: "10px",
  padding: "10px",
  fontSize: "20px",
  paddingBottom: "20px",
  boxShadow:
    "rgba(0, 0, 0, 0.3) 0px 10px 20px, rgba(0, 0, 0, 0.22) 0px 5px 9px",
  borderRadius: "5px",
  border: "2px solid #edeff4",
};
const todoStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  borderBottom: "1px solid #ddd",
  margin: "10px",
};
const todoStyleUL = {
  width: "50vw",
  margin: "10px",
  padding: "10px",
  fontSize: "20px",
  boxShadow:
    "rgba(0, 0, 0, 0.3) 0px 10px 20px, rgba(0, 0, 0, 0.22) 0px 5px 9px",
  borderRadius: "5px",
  border: "2px solid #edeff4",

  // display: "flex",
  // justifyContent: "space-between",
  // alignItems: "center",
  // padding: "10px",
  // borderBottom: "1px solid #ddd",
  // width: "100%",
};

const appContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  fontFamily: "Arial, sans-serif",
  padding: "20px",
  backgroundColor: "#f6f6f6",
};

const appHeaderStyle = {
  color: "#333",
};

const addTodoContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
};

const inputButtonStyleBase = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const addTodoInputStyle = {
  padding: "10px",
  marginRight: "10px",
  outline: "none",
  borderRadius: "3px",
};

const addTodoButtonStyle = {
  ...inputButtonStyleBase,
  backgroundColor: "#5cb85c",
  color: "white",
  "&:hover": {
    backgroundColor: "#449d44",
  },
};

const editButtonStyle = {
  ...inputButtonStyleBase,
  backgroundColor: "#5bc0de",
  color: "white",
  marginRight: "5px",
  "&:hover": {
    backgroundColor: "#31b0d5",
  },
};

const deleteButtonStyle = {
  ...inputButtonStyleBase,
  backgroundColor: "#d9534f",
  color: "white",
  "&:hover": {
    backgroundColor: "#c9302c",
  },
};

const editTodoContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  marginTop: "10px",
};

const cancelButtonStyle = {
  ...inputButtonStyleBase,
  backgroundColor: "#d9534f",
  color: "white",
  "&:hover": {
    backgroundColor: "#c9302c",
  },
};

const saveButtonStyle = {
  ...inputButtonStyleBase,
  marginLeft: "10px",
  backgroundColor: "#5cb85c",
  color: "white",
  "&:hover": {
    backgroundColor: "#449d44",
  },
};

const editTodoInputStyle = {
  flex: "1",
  padding: "10px",
  marginRight: "10px",
  outline: "none",
  borderRadius: "3px",
};

export default App;
