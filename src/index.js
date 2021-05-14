import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./monaco/monaco.init";

ReactDOM.render(
  <BrowserRouter>
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
