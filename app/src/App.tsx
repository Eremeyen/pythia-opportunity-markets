import "./App.css";
import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<div />} />
      </Route>
    </Routes>
  );
}

export default App;
