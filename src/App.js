import React, { useEffect, useState } from "react";
import { createStore } from "redux";
import { v4 as uuidv4 } from "uuid";
import useForceUpdate from "use-force-update";
import moment from "moment";
import "./App.css";
import "./styleApp.css";
///////////////////////////////////////
///////////////////////////////////////
/*const init = {
  activeThreadId: "1-fca2",
  threads: [
    {
      id: "1-fca2",
      title: "Buzz",
      message: [
        {
          text: "this is in frist tabs",
          timeStamp: moment().format("LT"),
          id: uuidv4(),
        },
      ],
    },
    {
      id: "2-be91",
      title: "Michael",
      message: [],
    },
  ],
};*/

/*function createStore() {
  const [state, dispatch] = useReducer(reducer, init);
  const getState = () => state;
  return {
    dispatch,
    getState
  };
}*/
function reducer(state = {}, action) {
  return {
    activeThreadId: activeThreadIdReducer(state.activeThreadId, action),
    threads: ThreadsReducer(state.threads, action),
  };
}
/////////////////////////subReducer////////////
function findThreadIndex(state, action) {
  switch (action.type) {
    case "ADD-MESSAGE":
      return state.findIndex((t) => t.id === action.threadId);
    case "DELETE-MESSAGE":
      return state.findIndex((t) => t.message.find((m) => m.id === action.id));
    default:
      return state;
  }
}
function ThreadsReducer(
  state = [
    {
      id: "1-fca2",
      title: "Buzz",
      message: [
        {
          text: "this is in frist tabs",
          timeStamp: moment().format("LT"),
          id: uuidv4(),
        },
      ],
    },
    {
      id: "2-be91",
      title: "Michael",
      message: [],
    },
  ],
  action
) {
  switch (action.type) {
    case "ADD-MESSAGE":
    case "DELETE-MESSAGE":
      const threadIndexDelete = findThreadIndex(state, action);
      const oldThreadDelete = state[threadIndexDelete];
      const newThreadDelete = {
        ...oldThreadDelete,
        message: messageReducer(oldThreadDelete.message, action),
      };
      return [
        ...state.slice(0, threadIndexDelete),
        newThreadDelete,
        ...state.slice(threadIndexDelete + 1, state.length),
      ];
    default:
      return state;
  }
}
function messageReducer(state = [], action) {
  switch (action.type) {
    case "ADD-MESSAGE":
      const newMessage = {
        text: action.message,
        timeStamp: moment().format("LT"),
        id: uuidv4(),
      };
      return [...state, newMessage];
    case "DELETE-MESSAGE":
      return state.filter((m) => m.id !== action.id);
    default:
      return state;
  }
}

function activeThreadIdReducer(state = "1-fca2", action) {
  if (action.type === "OPEN-THREAD") {
    return action.id;
  } else {
    return state;
  }
}

//////////////////////////store//////////////////////
const store = createStore(reducer);
/////////////////////////App/////////////////////////
export default function App() {
  return (
    <div className="App">
      <div className="contianer">
        <ThreadsTab />
        <ThreadDispaly />
      </div>
    </div>
  );
}

////////////////Component/////////////////
const Tabs = (props) => (
  <div className="itemContainer">
    {props.tabs.map((tab, index) => (
      <div
        key={index}
        className={tab.active ? "item active" : "item"}
        onClick={() => props.handleClick(tab.id)}
      >
        {tab.title}
      </div>
    ))}
  </div>
);
function ThreadsTab() {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    store.subscribe(() => forceUpdate());
  }, []);

  const state = store.getState();
  const threads = state.threads;
  const activeThreadId = state.activeThreadId;
  const tabs = threads.map((t) => ({
    title: t.title,
    active: t.id === activeThreadId,
    id: t.id,
  }));

  const handleClick = (id) => {
    store.dispatch({ type: "OPEN-THREAD", id: id });
  };
  return <Tabs handleClick={handleClick} tabs={tabs} />;
}

function TextFieldSubmit({ onSubmit }) {
  const [value, setValue] = useState("");
  const [disabled, setDisable] = useState(true);

  useEffect(() => {
    value !== "" ? setDisable(false) : setDisable(true);
  }, [value]);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const addMessage = (e) => {
    // store.dispatch({ type: "ADD-MESSAGE", message: value, threadId: threadId });
    onSubmit(value);
    setValue("");
    e.preventDefault();
  };

  return (
    <div>
      <form className="form" onSubmit={addMessage}>
        <input
          className="input"
          type="text"
          value={value}
          placeholder="Type a message"
          onChange={onChange}
        />
        <button className="btn" disabled={disabled}>
          send
        </button>
      </form>
    </div>
  );
}

const MessageList = ({ thread, handleDelete }) => (
  <div>
    {thread.message.map((text) => (
      <div
        key={text.id}
        onClick={() => handleDelete(text.id)}
        style={{
          marginBottom: "10px",
          fontSize: "10px",
          cursor: "pointer",
        }}
      >
        {text.text} <span>@{text.timeStamp}</span>
      </div>
    ))}
  </div>
);

function ThreadDispaly() {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    store.subscribe(() => forceUpdate());
  }, []);

  const state = store.getState();
  const threads = state.threads;
  const activeThreadId = state.activeThreadId;
  const activeThread = threads.find((t) => t.id === activeThreadId);

  const handleDelete = (id) => {
    store.dispatch({ type: "DELETE-MESSAGE", id: id });
  };
  const onSubmit = (value) => {
    store.dispatch({ type: "ADD-MESSAGE", message: value, threadId: activeThreadId });
  };

  return (
    <Thread
      handleDelete={handleDelete}
      onSubmit={onSubmit}
      thread={activeThread}
    />
  );
}

function Thread({ handleDelete, onSubmit, thread }) {
  return (
    <div className="num">
      <MessageList thread={thread} handleDelete={handleDelete} />
      <TextFieldSubmit onSubmit={onSubmit} />
    </div>
  );
}
